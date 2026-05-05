import { requireRole } from "@/src/lib/auth/guards";
import { ordersRepo } from "@/src/lib/repos/orders";
import Link from "next/link";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { adminNav } from "@/src/components/dashboard/adminNav";

export default async function AdminOrders() {
  await requireRole("admin");
  const orders = ordersRepo
    .all()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <DashboardShell
      eyebrow="Console"
      title="All orders"
      description={`${orders.length} order${orders.length === 1 ? "" : "s"} on file across the platform.`}
      nav={adminNav()}
      active="/admin/orders"
    >
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="The first sale will appear here." />
      ) : (
        <Section>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-[color:var(--fg-muted)] border-b border-[color:var(--border)]">
                  <th className="px-2 py-2.5">Order</th>
                  <th className="px-2 py-2.5">Date</th>
                  <th className="px-2 py-2.5">Items</th>
                  <th className="px-2 py-2.5 text-right">Total</th>
                  <th className="px-2 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[color:var(--muted)]/40 transition-colors">
                    <td className="px-2 py-2.5">
                      <Link href={`/orders/${o.id}`} className="font-mono text-xs hover:underline">
                        {o.id.slice(0, 16)}
                      </Link>
                    </td>
                    <td className="px-2 py-2.5 text-[color:var(--fg-muted)]">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="px-2 py-2.5">{o.items.length}</td>
                    <td className="px-2 py-2.5 text-right font-semibold tabular-nums">
                      {formatMoney(o.totalCents)}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <Badge variant={
                        o.paymentStatus === "completed" ? "success" :
                        o.paymentStatus === "refunded" || o.paymentStatus === "partially_refunded" ? "destructive" : "warn"
                      }>
                        {o.paymentStatus.replace("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </DashboardShell>
  );
}
