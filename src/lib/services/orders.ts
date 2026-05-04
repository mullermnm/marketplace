import { cookies } from "next/headers";
import { ordersRepo, OrderItem, makeDownloadToken } from "../repos/orders";
import { productsRepo } from "../repos/products";
import { usersRepo } from "../repos/users";
import { effectiveCommissionRate } from "./subscription";
import { ResolvedCartItem } from "./cart";
import { newId, newLicenseKey } from "../ids";
import { emailProvider, Templates } from "./email";
import { discountsRepo, commissionsRepo, affiliatesRepo, clicksRepo } from "../repos/misc";
import { defaultConfig } from "../config/platform";
import { runFraudChecks } from "./fraud";

export interface CheckoutContext {
  customerId: string;
  paddleCheckoutId: string;
  paddleTransactionId: string;
  cart: {
    items: ResolvedCartItem[];
    subtotalCents: number;
    discountCents: number;
    totalCents: number;
    appliedCodeId?: string;
    appliedCodeStr?: string;
  };
  ipAddress?: string;
  affiliateCookie?: string;
}

export async function finalizeOrder(ctx: CheckoutContext) {
  const customer = usersRepo.byId(ctx.customerId);
  if (!customer) throw new Error("Customer not found");

  // expand bundles into product line items
  const lineProducts: { productId: string; sellerId: string; title: string; priceCents: number }[] = [];
  for (const i of ctx.cart.items) {
    if (i.type === "product") {
      lineProducts.push({
        productId: i.id,
        sellerId: i.sellerId,
        title: i.title,
        priceCents: i.priceCents,
      });
    } else if (i.contains) {
      // distribute bundle price across contained products proportional to individualPrice
      const sumIndividual = i.contains.reduce((s, c) => s + c.priceCents, 0) || 1;
      const bundlePrice = i.priceCents;
      let allocated = 0;
      i.contains.forEach((c, idx) => {
        const isLast = idx === i.contains!.length - 1;
        const share = isLast
          ? bundlePrice - allocated
          : Math.floor((c.priceCents / sumIndividual) * bundlePrice);
        allocated += share;
        lineProducts.push({
          productId: c.productId,
          sellerId: c.sellerId,
          title: c.title,
          priceCents: share,
        });
      });
    }
  }

  // distribute discount proportionally across product line items
  const beforeDiscount = lineProducts.reduce((s, l) => s + l.priceCents, 0);
  const discount = ctx.cart.discountCents;
  if (discount > 0 && beforeDiscount > 0) {
    let allocated = 0;
    lineProducts.forEach((l, idx) => {
      const isLast = idx === lineProducts.length - 1;
      const share = isLast
        ? discount - allocated
        : Math.floor((l.priceCents / beforeDiscount) * discount);
      l.priceCents = Math.max(0, l.priceCents - share);
      allocated += share;
    });
  }

  const items: OrderItem[] = lineProducts.map((lp) => {
    const product = productsRepo.byId(lp.productId);
    const rate = effectiveCommissionRate(lp.sellerId);
    const commissionCents = Math.round((lp.priceCents * rate) / 100);
    const sellerPayoutCents = lp.priceCents - commissionCents;
    const tok = makeDownloadToken(defaultConfig.downloadWindowDays);
    return {
      productId: lp.productId,
      sellerId: lp.sellerId,
      title: lp.title,
      priceCents: lp.priceCents,
      commissionRate: rate,
      commissionCents,
      sellerPayoutCents,
      licenseKey: product?.isSoftware ? newLicenseKey() : undefined,
      ...tok,
      downloadCount: 0,
    };
  });

  const totalCommission = items.reduce((s, i) => s + i.commissionCents, 0);
  const totalPayout = items.reduce((s, i) => s + i.sellerPayoutCents, 0);
  const total = items.reduce((s, i) => s + i.priceCents, 0);

  // affiliate
  let affiliateId: string | undefined;
  let affiliateCommission = 0;
  if (ctx.affiliateCookie) {
    const aff = affiliatesRepo.byAffiliateId(ctx.affiliateCookie);
    if (aff) {
      affiliateId = aff.affiliateId;
      affiliateCommission = Math.round(
        (total * defaultConfig.affiliateCommissionRate) / 100,
      );
    }
  }

  // fraud check
  const fraud = runFraudChecks({
    customerId: ctx.customerId,
    totalCents: total,
    ipAddress: ctx.ipAddress ?? "",
  });

  const order = ordersRepo.create({
    customerId: ctx.customerId,
    items,
    subtotalCents: ctx.cart.subtotalCents,
    discountCents: ctx.cart.discountCents,
    totalCents: total,
    totalCommissionCents: totalCommission,
    totalSellerPayoutCents: totalPayout,
    discountCodeId: ctx.cart.appliedCodeId,
    discountCodeUsed: ctx.cart.appliedCodeStr,
    affiliateId,
    affiliateCommissionCents: affiliateCommission || undefined,
    paddleTransactionId: ctx.paddleTransactionId,
    paddleCheckoutId: ctx.paddleCheckoutId,
    paymentStatus: fraud.flags.length ? "pending" : "completed",
    fraudScore: fraud.score,
    fraudFlags: fraud.flags,
    requiresReview: fraud.flags.length > 0,
  });

  // bump product purchase counts
  for (const it of items) {
    const p = productsRepo.byId(it.productId);
    if (p) productsRepo.update(p.id, { purchaseCount: p.purchaseCount + 1 });
  }
  // discount code usage
  if (ctx.cart.appliedCodeId) {
    const code = ctx.cart.appliedCodeStr ? discountsRepo.byCode(ctx.cart.appliedCodeStr) : null;
    if (code) {
      discountsRepo.update(code.id, {
        currentUses: code.currentUses + 1,
        totalRevenueCents: code.totalRevenueCents + total,
        totalDiscountCents: code.totalDiscountCents + ctx.cart.discountCents,
      });
    }
  }
  // affiliate commission record
  if (affiliateId && affiliateCommission > 0 && !fraud.flags.length) {
    for (const it of items) {
      const productCommission = Math.round(
        (it.priceCents * defaultConfig.affiliateCommissionRate) / 100,
      );
      commissionsRepo.create({
        affiliateId,
        orderId: order.id,
        productId: it.productId,
        customerId: ctx.customerId,
        saleAmountCents: it.priceCents,
        commissionRate: defaultConfig.affiliateCommissionRate,
        commissionCents: productCommission,
      });
    }
    const aff = affiliatesRepo.byAffiliateId(affiliateId);
    if (aff) {
      affiliatesRepo.update(aff.id, {
        pendingCommissionsCents:
          aff.pendingCommissionsCents + affiliateCommission,
        totalEarningsCents: aff.totalEarningsCents + affiliateCommission,
      });
    }
  }

  // emails
  const itemsForEmail = items.map((i) => ({
    title: i.title,
    downloadUrl: `/api/download/${i.downloadToken}`,
    licenseKey: i.licenseKey,
  }));
  await emailProvider().send({
    to: customer.email,
    ...Templates.purchaseConfirmation(itemsForEmail),
  });
  const sellerIds = new Set(items.map((i) => i.sellerId));
  for (const sid of Array.from(sellerIds)) {
    const seller = usersRepo.byId(sid);
    if (seller) {
      const sales = items.filter((i) => i.sellerId === sid);
      const total = sales.reduce((s, i) => s + i.priceCents, 0);
      await emailProvider().send({
        to: seller.email,
        ...Templates.saleNotification(sales[0].title, total),
      });
    }
  }

  // clear affiliate cookie? leave it for tracking duration
  return order;
}

// invariant: total = sum(commission) + sum(sellerPayout)
export function checkOrderInvariant(orderId: string): boolean {
  const o = ordersRepo.byId(orderId);
  if (!o) return false;
  const sumComm = o.items.reduce((s, i) => s + i.commissionCents, 0);
  const sumPayout = o.items.reduce((s, i) => s + i.sellerPayoutCents, 0);
  const sumLine = o.items.reduce((s, i) => s + i.priceCents, 0);
  return sumComm + sumPayout === sumLine;
}
