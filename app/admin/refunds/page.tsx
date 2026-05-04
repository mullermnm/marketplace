import { requireRole } from "@/src/lib/auth/guards";
import { ordersRepo, OrderDoc } from "@/src/lib/repos/orders";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminRefunds() {
  await requireRole("admin");
  const all = ordersRepo
    .all()
    .filter((o) => o.paymentStatus === "completed" || o.paymentStatus === "partially_refunded")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const requested = all.filter((o) => o.requiresReview && o.refundReason);
  const others = all.filter((o) => !requested.includes(o));
  return (
    <div className="mx-auto max-w-4xl py-12 px-6 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] mb-1">
          Console
        </p>
        <h1 className="font-serif-display text-4xl tracking-tight">Refunds</h1>
        <p className="text-sm text-[color:var(--fg-muted)] mt-2">
          Customer-requested refunds appear at the top.
        </p>
      </div>

      {requested.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h2 className="font-medium">Customer requests ({requested.length})</h2>
          </div>
          <div className="space-y-3">
            {requested.map((o) => <RefundCard key={o.id} o={o} highlighted />)}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <h2 className="font-medium mb-3 text-[color:var(--fg-muted)]">All eligible orders</h2>
          <div className="space-y-3">
            {others.map((o) => <RefundCard key={o.id} o={o} />)}
          </div>
        </section>
      )}

      {all.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-sm text-[color:var(--fg-muted)]">No completed orders yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RefundCard({ o, highlighted = false }: { o: OrderDoc; highlighted?: boolean }) {
  return (
    <Card className={highlighted ? "border-amber-500/40 bg-amber-500/5" : ""}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Link href={`/orders/${o.id}`} className="font-mono text-sm hover:underline">
            {o.id.slice(0, 16)}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{formatMoney(o.totalCents)}</span>
            <Badge variant={o.paymentStatus === "partially_refunded" ? "warn" : "outline"}>
              {o.paymentStatus.replace("_", " ")}
            </Badge>
          </div>
        </div>
        {o.refundReason && (
          <div className="mb-3 rounded-md bg-[color:var(--card)] border border-[color:var(--border)] p-3 text-sm">
            <p className="text-xs uppercase tracking-widest text-[color:var(--fg-muted)] mb-1">Reason</p>
            <p>{o.refundReason}</p>
          </div>
        )}
        <ul className="divide-y divide-[color:var(--border)]">
          {o.items.map((i) => (
            <li key={i.productId} className="py-2.5 flex justify-between items-center text-sm">
              <span className={i.refunded ? "text-[color:var(--fg-muted)] line-through" : ""}>
                {i.title}
                <span className="text-[color:var(--fg-muted)] ml-2 text-xs">{formatMoney(i.priceCents)}</span>
              </span>
              {i.refunded ? (
                <Badge variant="destructive">Refunded</Badge>
              ) : (
                <form action="/api/admin/refund" method="post" className="flex gap-2 items-center">
                  <input type="hidden" name="orderId" value={o.id} />
                  <input type="hidden" name="productId" value={i.productId} />
                  <input
                    name="reason"
                    placeholder="reason"
                    defaultValue={o.refundReason ?? ""}
                    className="h-8 rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-2 text-xs w-40"
                    required
                  />
                  <Button size="sm" variant="destructive" type="submit">Refund</Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
