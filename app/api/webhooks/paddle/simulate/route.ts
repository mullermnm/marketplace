import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { finalizeOrder } from "@/src/lib/services/orders";
import { readCart, resolveCart, clearCart } from "@/src/lib/services/cart";
import { activateTier, recordPaymentFailure } from "@/src/lib/services/subscription";
import { TierId } from "@/src/lib/config/tiers";
import { readAffiliateCookie } from "@/src/lib/services/affiliate";
import { newId } from "@/src/lib/ids";
import { discountsRepo } from "@/src/lib/repos/misc";
import { usersRepo } from "@/src/lib/repos/users";

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const checkoutId = String(fd.get("checkoutId"));
  const type = String(fd.get("type"));
  const fail = fd.get("fail") === "1";
  const ip = req.headers.get("x-forwarded-for") ?? "local";

  if (type === "subscription") {
    const email = String(fd.get("email"));
    const tierId = String(fd.get("tierId")) as TierId;
    const user = usersRepo.byEmail(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 400 });
    if (fail) {
      recordPaymentFailure(user.id);
      return NextResponse.redirect(new URL("/seller/subscription?failed=1", req.url));
    }
    activateTier(user.id, tierId, newId("psub"));
    return NextResponse.redirect(new URL("/seller/subscription?ok=1", req.url));
  }

  // products
  if (fail) {
    return NextResponse.redirect(new URL("/cart?failed=1", req.url));
  }
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  const cart = readCart();
  const resolved = resolveCart(cart);
  if (resolved.items.length === 0)
    return NextResponse.redirect(new URL("/cart", req.url));

  const code = cart.code ? discountsRepo.byCode(cart.code) : null;

  const order = await finalizeOrder({
    customerId: session.uid,
    paddleCheckoutId: checkoutId,
    paddleTransactionId: newId("ptx"),
    cart: {
      items: resolved.items,
      subtotalCents: resolved.subtotalCents,
      discountCents: resolved.discountCents,
      totalCents: resolved.totalCents,
      appliedCodeId: code?.id,
      appliedCodeStr: code?.code,
    },
    ipAddress: ip,
    affiliateCookie: readAffiliateCookie(),
  });
  clearCart();
  return NextResponse.redirect(new URL(`/orders/${order.id}`, req.url));
}
