import { cookies } from "next/headers";
import { productsRepo } from "../repos/products";
import { discountsRepo, DiscountCodeDoc } from "../repos/misc";
import { bundlesRepo } from "../repos/misc";

const COOKIE = "mp_cart";

export interface CartLine {
  type: "product" | "bundle";
  id: string;
}

export interface CartState {
  lines: CartLine[];
  code?: string;
}

export function readCart(): CartState {
  const v = cookies().get(COOKIE)?.value;
  if (!v) return { lines: [] };
  try {
    return JSON.parse(decodeURIComponent(v)) as CartState;
  } catch {
    return { lines: [] };
  }
}

export function writeCart(state: CartState) {
  cookies().set(COOKIE, encodeURIComponent(JSON.stringify(state)), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 7 * 24 * 3600,
  });
}

export function addToCart(line: CartLine) {
  const cart = readCart();
  if (cart.lines.find((l) => l.type === line.type && l.id === line.id)) return cart;
  cart.lines.push(line);
  writeCart(cart);
  return cart;
}

export function removeFromCart(line: CartLine) {
  const cart = readCart();
  cart.lines = cart.lines.filter(
    (l) => !(l.type === line.type && l.id === line.id),
  );
  writeCart(cart);
  return cart;
}

export function clearCart() {
  writeCart({ lines: [] });
}

export interface ResolvedCartItem {
  type: "product" | "bundle";
  id: string;
  title: string;
  priceCents: number;
  sellerId: string;
  // for bundles: list of contained products
  contains?: { productId: string; title: string; sellerId: string; priceCents: number }[];
}

export function resolveCart(state: CartState): {
  items: ResolvedCartItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  appliedCode?: DiscountCodeDoc;
  errors: string[];
} {
  const items: ResolvedCartItem[] = [];
  const errors: string[] = [];
  for (const l of state.lines) {
    if (l.type === "product") {
      const p = productsRepo.byId(l.id);
      if (!p || p.status !== "active") {
        errors.push(`Product ${l.id} unavailable`);
        continue;
      }
      items.push({
        type: "product",
        id: p.id,
        title: p.title,
        priceCents: p.priceCents,
        sellerId: p.sellerId,
      });
    } else {
      const b = bundlesRepo.byId(l.id);
      if (!b || b.status !== "active") {
        errors.push(`Bundle ${l.id} unavailable`);
        continue;
      }
      items.push({
        type: "bundle",
        id: b.id,
        title: b.title,
        priceCents: b.bundlePriceCents,
        sellerId: b.sellerId,
        contains: b.products.map((p: any) => ({
          productId: p.productId,
          title: p.title,
          sellerId: b.sellerId,
          priceCents: p.individualPriceCents,
        })),
      });
    }
  }
  const subtotalCents = items.reduce((s, i) => s + i.priceCents, 0);
  let discountCents = 0;
  let appliedCode: DiscountCodeDoc | undefined;
  if (state.code) {
    const code = discountsRepo.byCode(state.code);
    if (code && code.isActive) {
      const now = Date.now();
      const valid =
        new Date(code.startDate).getTime() <= now &&
        now <= new Date(code.endDate).getTime() &&
        (code.maxUses == null || code.currentUses < code.maxUses);
      if (valid) {
        const eligibleSum = items
          .filter(
            (i) =>
              i.type === "product" &&
              (code.applicableProductIds.length === 0 ||
                code.applicableProductIds.includes(i.id)),
          )
          .reduce((s, i) => s + i.priceCents, 0);
        if (code.discountType === "percentage") {
          discountCents = Math.floor((eligibleSum * code.discountValue) / 100);
        } else {
          discountCents = Math.min(eligibleSum, Math.floor(code.discountValue));
        }
        appliedCode = code;
      } else {
        errors.push("Discount code is not valid");
      }
    } else {
      errors.push("Discount code not found");
    }
  }
  const totalCents = Math.max(0, subtotalCents - discountCents);
  return { items, subtotalCents, discountCents, totalCents, appliedCode, errors };
}

export function applyCode(code: string | null) {
  const cart = readCart();
  if (!code) delete cart.code;
  else cart.code = code;
  writeCart(cart);
  return cart;
}
