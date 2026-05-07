import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { paddle } from "@/src/lib/services/paddle";
import { ordersRepo } from "@/src/lib/repos/orders";
import { discountsRepo } from "@/src/lib/repos/misc";
import { finalizeOrder } from "@/src/lib/services/orders";
import { clearCart } from "@/src/lib/services/cart";
import { readAffiliateCookie } from "@/src/lib/services/affiliate";

/**
 * Client-confirm bridge: called by CartActions after Paddle.js
 * fires checkout.completed. Pulls the transaction from Paddle,
 * reconstructs the cart from custom_data, and creates the order
 * — without needing the webhook to arrive (great for local dev).
 *
 * Idempotent: if the order already exists for this transaction
 * (because the webhook beat us to it), we return that order id.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const transactionId = String(body.transactionId ?? "");
  if (!transactionId)
    return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });

  // Idempotency: maybe the webhook already created this order
  const existing = ordersRepo
    .all()
    .find((o) => o.paddleTransactionId === transactionId);
  if (existing && existing.customerId === session.uid) {
    clearCart();
    return NextResponse.json({ orderId: existing.id });
  }

  try {
    const tx = await paddle().getTransaction(transactionId);
    if (tx.status !== "completed" && tx.status !== "paid") {
      return NextResponse.json(
        { error: `Transaction not paid (status: ${tx.status})` },
        { status: 409 },
      );
    }
    const meta = (tx.customData ?? {}) as any;
    const customerId: string = meta.userId ?? session.uid;
    if (customerId !== session.uid) {
      return NextResponse.json(
        { error: "Transaction belongs to another user" },
        { status: 403 },
      );
    }

    // Rebuild the cart from custom_data.cart (set in /api/checkout)
    let items: any[] = [];
    try {
      items = meta.cart ? JSON.parse(meta.cart) : [];
    } catch {
      items = [];
    }
    if (items.length === 0) {
      // Fallback: rebuild from Paddle line items (no bundle support)
      items = tx.items.map((it) => ({
        type: "product",
        id: it.priceId,
        title: it.priceName,
        priceCents: it.priceCents,
        sellerId: "",
      }));
    }
    const subtotalCents = items.reduce(
      (s: number, i: any) => s + (i.priceCents ?? 0),
      0,
    );

    const codeStr: string | undefined = meta.code || undefined;
    const code = codeStr ? discountsRepo.byCode(codeStr) : null;
    let discountCents = 0;
    if (code) {
      const eligible = items
        .filter(
          (i: any) =>
            i.type === "product" &&
            (code.applicableProductIds.length === 0 ||
              code.applicableProductIds.includes(i.id)),
        )
        .reduce((s: number, i: any) => s + i.priceCents, 0);
      discountCents =
        code.discountType === "percentage"
          ? Math.floor((eligible * code.discountValue) / 100)
          : Math.min(eligible, Math.floor(code.discountValue));
    }

    const order = await finalizeOrder({
      customerId,
      paddleCheckoutId: transactionId,
      paddleTransactionId: transactionId,
      cart: {
        items,
        subtotalCents,
        discountCents,
        totalCents: Math.max(0, subtotalCents - discountCents),
        appliedCodeId: code?.id,
        appliedCodeStr: code?.code,
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? "client-confirm",
      affiliateCookie: readAffiliateCookie(),
    });
    clearCart();
    return NextResponse.json({ orderId: order.id });
  } catch (e: any) {
    console.error("[checkout/confirm] error", e);
    return NextResponse.json(
      { error: e?.message ?? "Confirm failed" },
      { status: 500 },
    );
  }
}
