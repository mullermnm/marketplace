import { requireRole } from "@/src/lib/auth/guards";
import { payoutsRepo } from "@/src/lib/repos/misc";
import { ordersRepo } from "@/src/lib/repos/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { formatMoney } from "@/src/lib/utils";

export default async function PayoutsPage() {
  const session = await requireRole("seller");
  const payouts = payoutsRepo.byRecipient(session.uid);
  // pending balance: sum of unpaid completed-order seller payouts not yet in a payout
  const orders = ordersRepo.bySeller(session.uid).filter((o) => o.paymentStatus === "completed");
  const paidOrderIds = new Set(payouts.flatMap((p) => p.orderIds ?? []));
  let pending = 0;
  for (const o of orders) {
    if (paidOrderIds.has(o.id)) continue;
    for (const i of o.items) {
      if (i.sellerId === session.uid && !i.refunded) pending += i.sellerPayoutCents;
    }
  }
  return (
    <div className="mx-auto max-w-3xl py-8 px-4 space-y-4">
      <h1 className="text-2xl font-semibold">Payouts</h1>
      <Card>
        <CardHeader><CardTitle>Pending balance</CardTitle></CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatMoney(pending)}</p>
          <p className="text-sm text-muted-foreground">Paid weekly when balance ≥ $50.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent>
          {payouts.length === 0 && <p className="text-muted-foreground text-sm">No payouts yet.</p>}
          <ul className="text-sm space-y-1">
            {payouts.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-border pb-1">
                <span>{new Date(p.scheduledDate).toLocaleDateString()}</span>
                <span>{formatMoney(p.amountCents)} — {p.status}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
