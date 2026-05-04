import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { readCart, resolveCart } from "@/src/lib/services/cart";
import { paddle } from "@/src/lib/services/paddle";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  const cart = readCart();
  const resolved = resolveCart(cart);
  if (resolved.items.length === 0)
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  if (resolved.errors.length)
    return NextResponse.json({ error: resolved.errors.join(", ") }, { status: 400 });

  const checkout = await paddle().createCheckoutSession({
    customerEmail: session.email,
    items: resolved.items.map((i) => ({
      name: i.title,
      priceCents: i.priceCents,
      quantity: 1,
    })),
    metadata: {
      userId: session.uid,
      code: cart.code ?? "",
    },
  });
  return NextResponse.json({ checkoutUrl: checkout.checkoutUrl });
}
