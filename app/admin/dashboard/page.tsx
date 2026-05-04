import { requireRole } from "@/src/lib/auth/guards";
import { adminAnalytics } from "@/src/lib/services/analytics";
import { Card, CardContent } from "@/src/components/ui/card";
import { StatCard } from "@/src/components/shared/StatCard";
import { formatMoney } from "@/src/lib/utils";
import Link from "next/link";

const NAV: [string, string][] = [
  ["Overview", "/admin/dashboard"],
  ["Pending sellers", "/admin/sellers/pending"],
  ["Pending products", "/admin/products/pending"],
  ["Sellers", "/admin/sellers"],
  ["Orders", "/admin/orders"],
  ["Refunds", "/admin/refunds"],
  ["Fraud", "/admin/fraud"],
  ["Categories", "/admin/categories"],
];

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; range?: string };
}) {
  await requireRole("admin");
  const range = parseRange(searchParams);
  const a = adminAnalytics(range);
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] mb-1">
          Console
        </p>
        <h1 className="font-serif-display text-4xl tracking-tight">Platform overview</h1>
      </div>

      <RangeBar active={searchParams.range ?? "month"} />
      <nav className="flex gap-1 border-b border-[color:var(--border)] overflow-x-auto">
        {NAV.map(([label, href], i) => (
          <Link
            key={href}
            href={href}
            className={`relative px-3 py-2.5 text-sm whitespace-nowrap transition-colors ${i === 0 ? "text-[color:var(--fg)] font-medium" : "text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]"}`}
          >
            {label}
            {i === 0 && <span className="absolute inset-x-3 bottom-0 h-px bg-[color:var(--fg)]" />}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="GMV (mo)" value={formatMoney(a.gmvCents)} accent />
        <StatCard label="Platform revenue (mo)" value={formatMoney(a.platformRevenueCents)} hint="commissions" />
        <StatCard label="Seller revenue (mo)" value={formatMoney(a.sellerRevenueCents)} hint="net of fees" />
        <StatCard label="Active sellers" value={a.activeSellers} />
        <StatCard label="Customers" value={a.activeCustomers} />
        <StatCard label="Active products" value={a.activeProducts} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Top sellers</h3>
            {a.topSellers.length === 0 ? (
              <p className="text-sm text-[color:var(--fg-muted)]">No data yet.</p>
            ) : (
              <ol className="divide-y divide-[color:var(--border)]">
                {a.topSellers.map((s, i) => (
                  <li key={s.id} className="py-3 flex items-center gap-3">
                    <span className="text-xs font-mono text-[color:var(--fg-muted)] w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="grid place-items-center h-8 w-8 rounded-full bg-gradient-to-br from-[color:var(--brand-500)] to-[color:var(--brand-700)] text-white text-xs font-semibold">
                      {s.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="flex-1 text-sm">{s.name}</span>
                    <span className="font-semibold tracking-tight">{formatMoney(s.revenueCents)}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Top products</h3>
            {a.topProducts.length === 0 ? (
              <p className="text-sm text-[color:var(--fg-muted)]">No data yet.</p>
            ) : (
              <ol className="divide-y divide-[color:var(--border)]">
                {a.topProducts.map((p, i) => (
                  <li key={p.id} className="py-3 flex items-center gap-3">
                    <span className="text-xs font-mono text-[color:var(--fg-muted)] w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Link href={`/products/${p.id}`} className="flex-1 text-sm hover:underline line-clamp-1">
                      {p.title}
                    </Link>
                    <span className="text-xs text-[color:var(--fg-muted)] font-mono">
                      {p.purchaseCount} sold
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function parseRange(sp: { from?: string; to?: string; range?: string }) {
  const now = new Date();
  if (sp.range === "7d") {
    return { from: new Date(now.getTime() - 7 * 24 * 3600 * 1000), to: now };
  }
  if (sp.range === "90d") {
    return { from: new Date(now.getTime() - 90 * 24 * 3600 * 1000), to: now };
  }
  if (sp.range === "ytd") {
    return { from: new Date(now.getFullYear(), 0, 1), to: now };
  }
  if (sp.from && sp.to) {
    return { from: new Date(sp.from), to: new Date(sp.to) };
  }
  return undefined;
}

function RangeBar({ active }: { active: string }) {
  const opts: [string, string][] = [
    ["month", "This month"],
    ["7d", "Last 7d"],
    ["90d", "Last 90d"],
    ["ytd", "YTD"],
  ];
  return (
    <div className="inline-flex rounded-md border border-[color:var(--border)] bg-[color:var(--card)] p-1 w-fit">
      {opts.map(([k, label]) => (
        <Link
          key={k}
          href={k === "month" ? "/admin/dashboard" : `/admin/dashboard?range=${k}`}
          className={`px-3 py-1 rounded text-xs transition-colors ${active === k ? "bg-[color:var(--fg)] text-[color:var(--bg)]" : "text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]"}`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
