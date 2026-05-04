import { ordersRepo } from "../repos/orders";
import { commissionsRepo, payoutsRepo, affiliatesRepo } from "../repos/misc";
import { usersRepo } from "../repos/users";
import { defaultConfig } from "../config/platform";
import { paddle } from "./paddle";
import { emailProvider, Templates } from "./email";

export async function runSellerPayouts(
  periodStart: Date,
  periodEnd: Date,
): Promise<{ created: number; total: number }> {
  // aggregate completed orders by seller
  const earningsBySeller = new Map<string, { cents: number; orderIds: Set<string> }>();
  for (const o of ordersRepo.all()) {
    if (o.paymentStatus !== "completed") continue;
    const t = new Date(o.createdAt).getTime();
    if (t < periodStart.getTime() || t >= periodEnd.getTime()) continue;
    for (const item of o.items) {
      if (item.refunded) continue;
      const cur = earningsBySeller.get(item.sellerId) ?? {
        cents: 0,
        orderIds: new Set(),
      };
      cur.cents += item.sellerPayoutCents;
      cur.orderIds.add(o.id);
      earningsBySeller.set(item.sellerId, cur);
    }
  }
  let created = 0;
  let total = 0;
  for (const [sellerId, agg] of Array.from(earningsBySeller)) {
    if (agg.cents < defaultConfig.sellerPayoutThresholdCents) continue;
    const payout = payoutsRepo.create({
      recipientId: sellerId,
      recipientType: "seller",
      amountCents: agg.cents,
      currency: "USD",
      orderIds: Array.from(agg.orderIds),
      status: "processing",
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      scheduledDate: new Date().toISOString(),
    });
    const result = await paddle().payout({
      recipientId: sellerId,
      amountCents: agg.cents,
      currency: "USD",
    });
    payoutsRepo.update(payout.id, {
      status: result.ok ? "completed" : "failed",
      paddlePayoutId: result.payoutId,
      completedAt: new Date().toISOString(),
      failureReason: result.ok ? undefined : "Paddle returned non-ok",
    });
    const seller = usersRepo.byId(sellerId);
    if (seller && result.ok) {
      await emailProvider().send({
        to: seller.email,
        ...Templates.payoutConfirmation(agg.cents),
      });
    }
    created++;
    total += agg.cents;
  }
  return { created, total };
}

export async function runAffiliatePayouts(
  periodStart: Date,
  periodEnd: Date,
): Promise<{ created: number; total: number }> {
  const byAff = new Map<string, { cents: number; ids: string[] }>();
  // aggregate pending commissions
  for (const aff of (require("../db/store").store.affiliates.all() as any[])) {
    const pending = commissionsRepo.pendingByAffiliate(aff.affiliateId);
    const inWindow = pending.filter((c: any) => {
      const t = new Date(c.createdAt).getTime();
      return t >= periodStart.getTime() && t < periodEnd.getTime();
    });
    if (inWindow.length === 0) continue;
    const cents = inWindow.reduce((s: number, c: any) => s + c.commissionCents, 0);
    byAff.set(aff.affiliateId, { cents, ids: inWindow.map((c: any) => c.id) });
  }
  let created = 0;
  let total = 0;
  for (const [affiliateId, agg] of Array.from(byAff)) {
    if (agg.cents < defaultConfig.affiliatePayoutThresholdCents) continue;
    const aff = affiliatesRepo.byAffiliateId(affiliateId);
    if (!aff) continue;
    const payout = payoutsRepo.create({
      recipientId: aff.userId,
      recipientType: "affiliate",
      amountCents: agg.cents,
      currency: "USD",
      commissionIds: agg.ids,
      status: "processing",
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      scheduledDate: new Date().toISOString(),
    });
    const result = await paddle().payout({
      recipientId: aff.userId,
      amountCents: agg.cents,
      currency: "USD",
    });
    payoutsRepo.update(payout.id, {
      status: result.ok ? "completed" : "failed",
      paddlePayoutId: result.payoutId,
      completedAt: new Date().toISOString(),
    });
    if (result.ok) {
      for (const cid of agg.ids) {
        commissionsRepo.update(cid, {
          status: "paid",
          payoutId: payout.id,
          paidAt: new Date().toISOString(),
        });
      }
      affiliatesRepo.update(aff.id, {
        pendingCommissionsCents: Math.max(0, aff.pendingCommissionsCents - agg.cents),
        paidCommissionsCents: aff.paidCommissionsCents + agg.cents,
      });
      const user = usersRepo.byId(aff.userId);
      if (user)
        await emailProvider().send({
          to: user.email,
          ...Templates.payoutConfirmation(agg.cents),
        });
    }
    created++;
    total += agg.cents;
  }
  return { created, total };
}
