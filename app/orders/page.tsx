import { requireUser } from "@/src/lib/auth/guards";
import { ordersRepo } from "@/src/lib/repos/orders";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";
import { ArrowRight } from "lucide-react";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { customerNav } from "@/src/components/dashboard/customerNav";

export default async function OrdersPage() {
  const session = await requireUser();
  const orders = ordersRepo
    .byCustomer(session.uid)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <DashboardShell
      eyebrow="Account"
      title="Your orders"
      description={`${orders.length} order${orders.length === 1 ? "" : "s"} on file.`}
      nav={customerNav(session.uid)}
      active="/orders"
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/products">
            Buy something else <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      }
    >
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Pick up something from the marketplace — every download is instant."
          action={
            <Button asChild variant="primary" size="sm">
              <Link href="/products">Browse marketplace</Link>
            </Button>
          }
        />
      ) : (
        <Section>
          <ul className="divide-y divide-[color:var(--border)] -mx-1">
            {orders.map((o) => (
              <li key={o.id} className="px-1 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/orders/${o.id}`} className="font-mono text-sm hover:underline">
                    {o.id.slice(0, 16)}
                  </Link>
                  <p className="mt-1 line-clamp-1 text-[color:var(--fg-muted)] text-sm">
                    {o.items.length} item{o.items.length === 1 ? "" : "s"} ·{" "}
                    {o.items.map((i) => i.title).join(", ")}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[color:var(--fg-muted)]">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={
                    o.paymentStatus === "completed" ? "success" :
                    o.paymentStatus === "refunded" || o.paymentStatus === "partially_refunded" ? "destructive" : "warn"
                  }>
                    {o.paymentStatus.replace("_", " ")}
                  </Badge>
                  <span className="font-semibold tracking-tight tabular-nums w-20 text-right">
                    {formatMoney(o.totalCents)}
                  </span>
                  <Link href={`/orders/${o.id}`} className="text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </DashboardShell>
  );
}
