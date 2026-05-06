import { NextRequest, NextResponse } from "next/server";
import { paddle } from "@/src/lib/services/paddle";
import { activateTier, recordPaymentFailure } from "@/src/lib/services/subscription";
import { usersRepo } from "@/src/lib/repos/users";
import { TierId } from "@/src/lib/config/tiers";
import { finalizeOrder } from "@/src/lib/services/orders";
import { ordersRepo } from "@/src/lib/repos/orders";
import { discountsRepo } from "@/src/lib/repos/misc";

// Paddle Billing webhook handler. Verifies signature, then dispatches.
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("paddle-signature");
  if (!paddle().verifyWebhook(raw, sig)) {
    console.warn("[paddle] webhook rejected: bad signature");
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }
  let evt: any;
  try {
    evt = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  const type: string = evt.event_type;
  const data = evt.data ?? {};
  console.log(`[paddle] webhook ${type}`);

  try {
    switch (type) {
      // ─── Subscriptions ───────────────────────────────────────
      case "subscription.created":
      case "subscription.updated":
      case "subscription.activated": {
        const email: string =
          data.customer?.email ??
          data.customer_email ??
          data.billing_details?.customer_email;
        const tier: TierId = data.custom_data?.tierId ?? "basic";
        const user = email ? usersRepo.byEmail(email) : null;
        if (user) activateTier(user.id, tier, data.id);
        break;
      }
      case "subscription.canceled":
      case "subscription.cancelled": {
        const email: string = data.customer?.email;
        const user = email ? usersRepo.byEmail(email) : null;
        if (user) activateTier(user.id, "free_trial");
        break;
      }
      case "subscription.payment_failed": {
        const email: string = data.customer?.email;
        const user = email ? usersRepo.byEmail(email) : null;
        if (user) recordPaymentFailure(user.id);
        break;
      }

      // ─── One-off product transactions ────────────────────────
      case "transaction.completed": {
        const meta = data.custom_data ?? {};
        const userId: string | undefined = meta.userId;
        const codeStr: string | undefined = meta.code;
        if (!userId) {
          console.warn("[paddle] transaction.completed without userId");
          break;
        }
        const user = usersRepo.byId(userId);
        if (!user) break;
        // Idempotency: avoid double-creating an order for retried webhooks
        const existing = ordersRepo
          .all()
          .find((o) => o.paddleTransactionId === data.id);
        if (existing) break;

        // Prefer the cart blob we tucked into custom_data at /api/checkout
        let items: any[] = [];
        try {
          items = meta.cart ? JSON.parse(meta.cart) : [];
        } catch {
          items = [];
        }
        if (items.length === 0) {
          items = ((data.items ?? []) as any[]).map((it) => ({
            type: "product",
            id: it.price?.id ?? "",
            title: it.price?.name ?? "Item",
            priceCents: parseInt(it.price?.unit_price?.amount ?? "0", 10),
            sellerId: "",
          }));
        }
        const subtotalCents = items.reduce(
          (s: number, i: any) => s + (i.priceCents ?? 0),
          0,
        );
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
        await finalizeOrder({
          customerId: userId,
          paddleCheckoutId: data.id,
          paddleTransactionId: data.id,
          cart: {
            items,
            subtotalCents,
            discountCents,
            totalCents: Math.max(0, subtotalCents - discountCents),
            appliedCodeId: code?.id,
            appliedCodeStr: code?.code,
          },
          ipAddress: req.headers.get("x-forwarded-for") ?? "paddle-webhook",
        });
        break;
      }
      case "transaction.payment_failed": {
        // Could surface a dunning notice; for now we log.
        break;
      }

      // ─── Refunds ─────────────────────────────────────────────
      case "adjustment.created": {
        if (data.action === "refund") {
          const txId: string | undefined = data.transaction_id;
          if (txId) {
            const order = ordersRepo
              .all()
              .find((o) => o.paddleTransactionId === txId);
            if (order) {
              ordersRepo.update(order.id, {
                paymentStatus: "refunded",
                refundedAt: new Date().toISOString(),
                refundReason: data.reason ?? "Paddle refund",
                items: order.items.map((i) => ({ ...i, refunded: true })),
              });
            }
          }
        }
        break;
      }

      default:
        console.log(`[paddle] unhandled event_type: ${type}`);
    }
  } catch (e) {
    console.error("[paddle] handler error", e);
  }

  // Always 200 so Paddle stops retrying once we've accepted the event.
  return NextResponse.json({ ok: true });
}
