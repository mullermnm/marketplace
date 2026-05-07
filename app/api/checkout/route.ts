import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { readCart, resolveCart } from "@/src/lib/services/cart";
import { paddle } from "@/src/lib/services/paddle";

export async function POST(_req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  const cart = readCart();
  const resolved = resolveCart(cart);
  if (resolved.items.length === 0)
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  if (resolved.errors.length)
    return NextResponse.json({ error: resolved.errors.join(", ") }, { status: 400 });

  // We pass the cart through Paddle's custom_data so the webhook can
  // reconstruct the order regardless of when the redirect lands.
  // Paddle stringifies object values; nested arrays of primitives are fine.
  try {
    const checkout = await paddle().createInlineCheckout({
      customerEmail: session.email,
      items: resolved.items.map((i) => ({
        name: i.title,
        priceCents: i.priceCents,
        quantity: 1,
      })),
      metadata: {
        userId: session.uid,
        code: cart.code ?? "",
        cart: JSON.stringify(
          resolved.items.map((i) => ({
            type: i.type,
            id: i.id,
            sellerId: i.sellerId,
            priceCents: i.priceCents,
            title: i.title,
            contains: i.contains,
          })),
        ),
      },
    });
    return NextResponse.json({ 
      transactionId: checkout.transactionId,
      items: checkout.items 
    });
  } catch (e: any) {
    console.error("[checkout] paddle error", e);
    return NextResponse.json(
      { error: e?.message ?? "Checkout failed" },
      { status: 500 },
    );
  }
}
