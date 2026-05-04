import { requireRole } from "@/src/lib/auth/guards";
import { sellerAnalytics } from "@/src/lib/services/analytics";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { ordersRepo } from "@/src/lib/repos/orders";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { StatCard } from "@/src/components/shared/StatCard";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";
import Link from "next/link";
import { TIERS } from "@/src/lib/config/tiers";
import { AreaChart, buildDailyRevenueSeries } from "@/src/components/charts/AreaChart";
import { Download } from "lucide-react";

const NAV: [string, string][] = [
  ["Overview", "/seller/dashboard"],
  ["Products", "/seller/products"],
  ["Discounts", "/seller/discounts"],
  ["Bundles", "/seller/bundles"],
  ["Payouts", "/seller/payouts"],
  ["Subscription", "/seller/subscription"],
];

export default async function SellerDashboard() {
  const session = await requireRole("seller");
  const a = sellerAnalytics(session.uid);
  const sub = subsRepo.byUserId(session.uid);
  const tierConfig = sub ? TIERS[sub.tier] : TIERS.free_trial;
  const productPct = sub && sub.productLimit > 0
    ? Math.min(100, (sub.currentProductCount / sub.productLimit) * 100) : 0;
  const storagePct = sub
    ? Math.min(100, (sub.currentStorageBytes / (sub.storageLimitGB * 1024 ** 3)) * 100) : 0;
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] mb-1">
            Studio
          </p>
          <h1 className="font-serif-display text-4xl tracking-tight">
            Welcome back, {session.name.split(" ")[0]}.
          </h1>
        </div>
        <Link href="/seller/products/new">
          <Button variant="primary" size="lg">+ New product</Button>
        </Link>
      </div>

      <nav className="flex gap-1 border-b border-[color:var(--border)]">
        {NAV.map(([label, href], i) => (
          <Link
            key={href}
            href={href}
            className={`relative px-4 py-2.5 text-sm transition-colors ${i === 0 ? "text-[color:var(--fg)] font-medium" : "text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]"}`}
          >
            {label}
            {i === 0 && (
              <span className="absolute inset-x-3 bottom-0 h-px bg-[color:var(--fg)]" />
            )}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="This month" value={formatMoney(a.monthRevenueCents)} hint="net of commission" accent />
        <StatCard label="All time" value={formatMoney(a.allTimeRevenueCents)} />
        <StatCard label="Sales (mo)" value={a.monthSales.toString()} />
        <StatCard label="Conversion" value={`${a.conversionRate.toFixed(1)}%`} hint="views → sales" />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">Revenue · last 14 days</h3>
              <p className="text-xs text-[color:var(--fg-muted)] mt-0.5">Net of platform commission</p>
            </div>
            <a href="/api/seller/export" download>
              <Button variant="outline" size="sm">
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
            </a>
          </div>
          <AreaChart
            data={buildDailyRevenueSeries(ordersRepo.bySeller(session.uid), session.uid, 14)}
            formatValue={(n) => formatMoney(n)}
          />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-medium">Top products</h3>
              <Link href="/seller/products" className="text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]">
                See all →
              </Link>
            </div>
            {a.topProducts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[color:var(--border)] p-8 text-center">
                <p className="text-sm text-[color:var(--fg-muted)] mb-3">No products yet.</p>
                <Link href="/seller/products/new"><Button size="sm">Create your first</Button></Link>
              </div>
            ) : (
              <ul className="divide-y divide-[color:var(--border)]">
                {a.topProducts.map((p) => (
                  <li key={p.id} className="py-3 flex items-center gap-3">
                    <span className="grid place-items-center h-9 w-9 rounded-md bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-xs font-mono">
                      {p.productType.slice(0, 3).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${p.id}`} className="text-sm font-medium hover:underline line-clamp-1">
                        {p.title}
                      </Link>
                      <p className="text-xs text-[color:var(--fg-muted)]">
                        {p.purchaseCount} sold · {formatMoney(p.priceCents)}
                      </p>
                    </div>
                    <Badge variant={p.status === "active" ? "success" : "warn"}>{p.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-[color:var(--fg-muted)]">Plan</p>
                <p className="font-serif-display text-2xl mt-1">{tierConfig.name}</p>
              </div>
              <Badge>{sub?.commissionRate}% fee</Badge>
            </div>
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
            <Link href="/seller/subscription">
              <Button variant="outline" className="w-full">Manage plan</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Meter({ label, current, pct }: { label: string; current: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="uppercase tracking-widest text-[color:var(--fg-muted)]">{label}</span>
        <span className="font-mono">{current}</span>
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
