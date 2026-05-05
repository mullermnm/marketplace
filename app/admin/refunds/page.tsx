import { requireRole } from "@/src/lib/auth/guards";
import { ordersRepo, OrderDoc } from "@/src/lib/repos/orders";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { adminNav } from "@/src/components/dashboard/adminNav";

export default async function AdminRefunds() {
  await requireRole("admin");
  const all = ordersRepo
    .all()
    .filter((o) => o.paymentStatus === "completed" || o.paymentStatus === "partially_refunded")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const requested = all.filter((o) => o.requiresReview && o.refundReason);
  const others = all.filter((o) => !requested.includes(o));
  return (
    <DashboardShell
      eyebrow="Console"
      title="Refunds"
      description="Customer-requested refunds appear at the top. Process individual line items or full orders."
      nav={adminNav()}
      active="/admin/refunds"
    >
      {requested.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h2 className="font-medium text-sm uppercase tracking-widest">
              Customer requests · {requested.length}
            </h2>
          </div>
          <div className="space-y-3">
            {requested.map((o) => <RefundCard key={o.id} o={o} highlighted />)}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <h2 className="font-medium text-sm uppercase tracking-widest text-[color:var(--fg-muted)] mb-3">
            All eligible orders · {others.length}
          </h2>
          <div className="space-y-3">
            {others.slice(0, 50).map((o) => <RefundCard key={o.id} o={o} />)}
          </div>
        </div>
      )}

      {all.length === 0 && (
        <EmptyState title="No completed orders yet" description="Once orders complete, refundable items show up here." />
      )}
    </DashboardShell>
  );
}

function RefundCard({ o, highlighted = false }: { o: OrderDoc; highlighted?: boolean }) {
  return (
    <Section className={highlighted ? "border-amber-500/40 bg-amber-500/5" : ""}>
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
          <p className="text-[10px] uppercase tracking-widest text-[color:var(--fg-muted)] mb-1">
            Customer reason
          </p>
          <p>{o.refundReason}</p>
        </div>
      )}
      <ul className="divide-y divide-[color:var(--border)]">
        {o.items.map((i) => (
          <li
            key={i.productId}
            className="py-2.5 flex justify-between items-center text-sm gap-2"
          >
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
    </Section>
  );
}
