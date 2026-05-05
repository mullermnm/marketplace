import Link from "next/link";
import { requireUser } from "@/src/lib/auth/guards";
import { ordersRepo } from "@/src/lib/repos/orders";
import { productsRepo } from "@/src/lib/repos/products";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";
import { Download, ArrowRight } from "lucide-react";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { StatTile } from "@/src/components/dashboard/Stats";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { customerNav } from "@/src/components/dashboard/customerNav";

export default async function CustomerDashboard() {
  const session = await requireUser();
  const orders = ordersRepo
    .byCustomer(session.uid)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalSpent = orders
    .filter((o) => o.paymentStatus === "completed")
    .reduce((s, o) => s + o.totalCents, 0);
  const itemCount = orders.reduce(
    (s, o) => s + o.items.filter((i) => !i.refunded).length,
    0,
  );
  const accessibleNow = orders.flatMap((o) =>
    o.items.filter(
      (i) =>
        !i.refunded && Date.now() < new Date(i.downloadTokenExpiry).getTime(),
    ),
  );
  const recent = orders.slice(0, 5);

  return (
    <DashboardShell
      eyebrow="Account"
      title={`Welcome back, ${session.name.split(" ")[0]}`}
      description="Your orders, downloads, and account preferences."
      nav={customerNav(session.uid)}
      active="/dashboard"
      actions={
        <Button asChild variant="primary" size="sm">
          <Link href="/products">
            Discover more <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatTile
          label="Total spent"
          value={formatMoney(totalSpent)}
          highlight
          hint={`${orders.length} order${orders.length === 1 ? "" : "s"}`}
        />
        <StatTile label="Items owned" value={itemCount} hint="active downloads" />
        <StatTile
          label="In download window"
          value={accessibleNow.length}
          hint="across orders"
        />
      </div>

      <Section
        title="Recent orders"
        action={
          <Link href="/orders" className="text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]">
            All orders →
          </Link>
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Find something you'll love — instant download, 30-day window."
            action={
              <Button asChild variant="primary" size="sm">
                <Link href="/products">Browse marketplace</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-[color:var(--border)] -mx-1">
            {recent.map((o) => (
              <li key={o.id} className="px-1 py-3 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <Link href={`/orders/${o.id}`} className="font-mono text-xs hover:underline">
                    {o.id.slice(0, 16)}
                  </Link>
                  <p className="mt-0.5 line-clamp-1 text-[color:var(--fg-muted)] text-xs">
                    {o.items.map((i) => i.title).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={
                    o.paymentStatus === "completed" ? "success" :
                    o.paymentStatus === "refunded" || o.paymentStatus === "partially_refunded" ? "destructive" : "warn"
                  }>
                    {o.paymentStatus.replace("_", " ")}
                  </Badge>
                  <span className="font-semibold tabular-nums w-20 text-right">
                    {formatMoney(o.totalCents)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {accessibleNow.length > 0 && (
        <Section title="Quick downloads" hint="Tokens valid in your 30-day window">
          <ul className="divide-y divide-[color:var(--border)] -mx-1">
            {accessibleNow.slice(0, 6).map((i) => {
              const product = productsRepo.byId(i.productId);
              return (
                <li
                  key={i.downloadToken}
                  className="px-1 py-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid place-items-center h-9 w-9 rounded-md bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 font-mono text-[10px] uppercase tracking-widest text-[color:var(--fg-muted)] shrink-0">
                      {(product?.productType ?? "bin").slice(0, 3).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-medium">{i.title}</p>
                      <p className="text-xs text-[color:var(--fg-muted)] mt-0.5">
                        Expires {new Date(i.downloadTokenExpiry).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/download/${i.downloadToken}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </li>
              );
            })}
          </ul>
        </Section>
      )}
    </DashboardShell>
  );
}
