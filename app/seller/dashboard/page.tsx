import { requireRole } from "@/src/lib/auth/guards";
import { sellerAnalytics } from "@/src/lib/services/analytics";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { ordersRepo } from "@/src/lib/repos/orders";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";
import Link from "next/link";
import { TIERS } from "@/src/lib/config/tiers";
import { AreaChart, buildDailyRevenueSeries } from "@/src/components/charts/AreaChart";
import { Download, Plus } from "lucide-react";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { StatTile } from "@/src/components/dashboard/Stats";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { sellerNav } from "@/src/components/dashboard/sellerNav";

export default async function SellerDashboard() {
  const session = await requireRole("seller");
  const a = sellerAnalytics(session.uid);
  const sub = subsRepo.byUserId(session.uid);
  const tierConfig = sub ? TIERS[sub.tier] : TIERS.free_trial;
  const orders = ordersRepo.bySeller(session.uid);
  const series = buildDailyRevenueSeries(orders, session.uid, 14);
  const sparkValues = series.map((p) => p.value);
  const productPct =
    sub && sub.productLimit > 0
      ? Math.min(100, (sub.currentProductCount / sub.productLimit) * 100)
      : 0;
  const storagePct = sub
    ? Math.min(100, (sub.currentStorageBytes / (sub.storageLimitGB * 1024 ** 3)) * 100)
    : 0;
  const recentOrders = [...orders]
    .filter((o) => o.paymentStatus === "completed")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  return (
    <DashboardShell
      eyebrow="Seller studio"
      title={`Hello, ${session.name.split(" ")[0]}`}
      description="Sales, payouts, and product performance — all in one place."
      nav={sellerNav(session.uid)}
      active="/seller/dashboard"
      actions={
        <>
          <a href="/api/seller/export" download>
            <Button variant="outline" size="sm">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </a>
          <Button asChild variant="primary" size="sm">
            <Link href="/seller/products/new">
              <Plus className="w-3.5 h-3.5" /> New product
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile
          label="This month"
          value={formatMoney(a.monthRevenueCents)}
          hint="net of fees"
          highlight
          spark={sparkValues}
          trend={
            sparkValues.length > 1
              ? {
                  value:
                    sparkValues[sparkValues.length - 1] >= sparkValues[0]
                      ? "trending up"
                      : "trending down",
                  positive:
                    sparkValues[sparkValues.length - 1] >= sparkValues[0],
                }
              : undefined
          }
        />
        <StatTile label="All time" value={formatMoney(a.allTimeRevenueCents)} hint="net of fees" />
        <StatTile label="Sales (mo)" value={a.monthSales} hint="completed orders" />
        <StatTile label="Conversion" value={`${a.conversionRate.toFixed(1)}%`} hint="views → sales" />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <Section
          title="Revenue · last 14 days"
          hint="Net of platform commission"
          action={
            <Link href="/seller/payouts" className="text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]">
              Payout details →
            </Link>
          }
        >
          <AreaChart data={series} formatValue={(n) => formatMoney(n)} />
        </Section>

        <Section title="Plan" hint={`${sub?.commissionRate ?? 10}% platform fee`}>
          <p className="font-serif-display text-3xl tracking-tight">{tierConfig.name}</p>
          <Meter
            label="Products"
            current={`${sub?.currentProductCount ?? 0} / ${sub?.productLimit === -1 ? "∞" : sub?.productLimit ?? 0}`}
            pct={productPct}
          />
          <Meter
            label="Storage"
            current={`${(((sub?.currentStorageBytes ?? 0) / 1024 / 1024).toFixed(1))} MB / ${sub?.storageLimitGB ?? 0} GB`}
            pct={storagePct}
          />
          <Button asChild variant="outline" className="w-full mt-4" size="sm">
            <Link href="/seller/subscription">Manage plan</Link>
          </Button>
        </Section>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Section
          title="Top products"
          action={
            <Link href="/seller/products" className="text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]">
              See all →
            </Link>
          }
        >
          {a.topProducts.length === 0 ? (
            <EmptyState
              title="No products yet"
              description="Add your first to start selling."
              action={
                <Button asChild variant="primary" size="sm">
                  <Link href="/seller/products/new">Create product</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-[color:var(--border)] -mx-1">
              {a.topProducts.map((p) => (
                <li key={p.id} className="px-1 py-3 flex items-center gap-3">
                  <span className="grid place-items-center h-9 w-9 rounded-md bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 font-mono text-[10px] uppercase tracking-widest text-[color:var(--fg-muted)]">
                    {p.productType.slice(0, 3).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${p.id}`}
                      className="text-sm font-medium hover:underline line-clamp-1"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-[color:var(--fg-muted)] mt-0.5">
                      {p.purchaseCount} sold · {formatMoney(p.priceCents)}
                    </p>
                  </div>
                  <Badge variant={p.status === "active" ? "success" : "warn"}>
                    {p.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Recent orders"
          action={
            <Link
              href="/seller/payouts"
              className="text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]"
            >
              All payouts →
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <EmptyState title="No sales yet" description="Once a buyer purchases, you'll see them here." />
          ) : (
            <ul className="divide-y divide-[color:var(--border)] -mx-1">
              {recentOrders.map((o) => {
                const myItems = o.items.filter((i) => i.sellerId === session.uid);
                const earned = myItems.reduce((s, i) => s + i.sellerPayoutCents, 0);
                return (
                  <li key={o.id} className="px-1 py-3 flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <Link href={`/orders/${o.id}`} className="font-mono text-xs hover:underline">
                        {o.id.slice(0, 12)}
                      </Link>
                      <p className="text-xs text-[color:var(--fg-muted)] mt-0.5 line-clamp-1">
                        {myItems.map((i) => i.title).join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{formatMoney(earned)}</p>
                      <p className="text-[10px] text-[color:var(--fg-muted)] mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>
    </DashboardShell>
  );
}

function Meter({ label, current, pct }: { label: string; current: string; pct: number }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between text-[10px] mb-1.5">
        <span className="uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">{label}</span>
        <span className="font-mono tabular-nums text-[color:var(--fg-muted)]">{current}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[color:var(--muted)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[color:var(--brand-500)] to-[color:var(--brand-700)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
