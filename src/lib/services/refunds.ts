import { ordersRepo } from "../repos/orders";
import { paddle } from "./paddle";
import { emailProvider, Templates } from "./email";
import { usersRepo } from "../repos/users";

export async function refundOrderItem(
  orderId: string,
  productId: string,
  reason: string,
  adminId: string,
) {
  const o = ordersRepo.byId(orderId);
  if (!o) throw new Error("Order not found");
  const item = o.items.find((i) => i.productId === productId);
  if (!item) throw new Error("Item not found");
  if (item.refunded) throw new Error("Already refunded");
  const result = await paddle().refund(o.paddleTransactionId, item.priceCents);
  if (!result.ok) throw new Error("Paddle refund failed");
  const newItems = o.items.map((i) =>
    i.productId === productId ? { ...i, refunded: true } : i,
  );
  const allRefunded = newItems.every((i) => i.refunded);
  const totalRefunded = newItems.filter((i) => i.refunded).reduce((s, i) => s + i.priceCents, 0);
  ordersRepo.update(orderId, {
    items: newItems,
    paymentStatus: allRefunded ? "refunded" : "partially_refunded",
    refundAmountCents: totalRefunded,
    refundedAt: new Date().toISOString(),
    refundReason: reason,
    reviewedBy: adminId,
    reviewedAt: new Date().toISOString(),
  });
  // emails
  const customer = usersRepo.byId(o.customerId);
  const seller = usersRepo.byId(item.sellerId);
  if (customer) {
    await emailProvider().send({
      to: customer.email,
      ...Templates.refundConfirmation(item.title, item.priceCents),
    });
  }
  if (seller) {
    await emailProvider().send({
      to: seller.email,
      ...Templates.refundConfirmation(item.title, item.priceCents),
    });
  }
  return { ok: true, refundId: result.refundId };
}

export async function refundFullOrder(orderId: string, reason: string, adminId: string) {
  const o = ordersRepo.byId(orderId);
  if (!o) throw new Error("Not found");
  for (const i of o.items) {
    if (!i.refunded) {
      await refundOrderItem(orderId, i.productId, reason, adminId);
    }
  }
}
