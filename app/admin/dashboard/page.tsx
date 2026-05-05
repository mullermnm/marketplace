import { requireRole } from "@/src/lib/auth/guards";
import { adminAnalytics } from "@/src/lib/services/analytics";
import { Button } from "@/src/components/ui/button";
import { formatMoney } from "@/src/lib/utils";
import Link from "next/link";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { StatTile } from "@/src/components/dashboard/Stats";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { adminNav } from "@/src/components/dashboard/adminNav";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; range?: string };
}) {
  await requireRole("admin");
  const range = parseRange(searchParams);
  const a = adminAnalytics(range);
  const active = searchParams.range ?? "month";
  const opts: [string, string, string][] = [
    ["month", "This month", "/admin/dashboard"],
    ["7d", "Last 7d", "/admin/dashboard?range=7d"],
    ["90d", "Last 90d", "/admin/dashboard?range=90d"],
    ["ytd", "YTD", "/admin/dashboard?range=ytd"],
  ];
  return (
    <DashboardShell
      eyebrow="Console"
      title="Platform overview"
      description="Marketplace health, revenue, and operational signals at a glance."
      nav={adminNav()}
      active="/admin/dashboard"
      actions={
        <div className="inline-flex rounded-md border border-[color:var(--border)] bg-[color:var(--card)] p-1">
          {opts.map(([k, label, href]) => (
            <Link
              key={k}
              href={href}
              className={`px-3 py-1 rounded text-xs transition-colors ${active === k ? "bg-[color:var(--fg)] text-[color:var(--bg)]" : "text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatTile label="GMV" value={formatMoney(a.gmvCents)} highlight hint="gross merchandise value" />
        <StatTile
          label="Platform revenue"
          value={formatMoney(a.platformRevenueCents)}
          hint="commissions"
        />
        <StatTile
          label="Seller revenue"
          value={formatMoney(a.sellerRevenueCents)}
          hint="net of fees"
        />
        <StatTile label="Active sellers" value={a.activeSellers} />
        <StatTile label="Customers" value={a.activeCustomers} />
        <StatTile label="Active products" value={a.activeProducts} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Section
          title="Top sellers"
          hint="By revenue this period"
          action={
            <Link href="/admin/sellers" className="text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]">
              All sellers →
            </Link>
          }
        >
          {a.topSellers.length === 0 ? (
            <EmptyState title="No data yet" description="Once orders come in, top sellers appear here." />
          ) : (
            <ol className="divide-y divide-[color:var(--border)] -mx-1">
              {a.topSellers.map((s, i) => (
                <li key={s.id} className="px-1 py-3 flex items-center gap-3">
                  <span className="text-xs font-mono text-[color:var(--fg-muted)] w-5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="grid place-items-center h-9 w-9 rounded-full bg-gradient-to-br from-[color:var(--brand-500)] to-[color:var(--brand-700)] text-white text-xs font-semibold">
                    {s.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 text-sm">{s.name}</span>
                  <span className="font-semibold tracking-tight tabular-nums">
                    {formatMoney(s.revenueCents)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Section>
        <Section
          title="Top products"
          hint="By unit volume"
        >
          {a.topProducts.length === 0 ? (
            <EmptyState title="No data yet" />
          ) : (
            <ol className="divide-y divide-[color:var(--border)] -mx-1">
              {a.topProducts.map((p, i) => (
                <li key={p.id} className="px-1 py-3 flex items-center gap-3">
                  <span className="text-xs font-mono text-[color:var(--fg-muted)] w-5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Link href={`/products/${p.id}`} className="flex-1 text-sm hover:underline line-clamp-1">
                    {p.title}
                  </Link>
                  <span className="text-xs text-[color:var(--fg-muted)] font-mono tabular-nums">
                    {p.purchaseCount} sold
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Section>
      </div>

      <Section title="Quick actions">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Quick href="/admin/sellers/pending" label="Approve sellers" />
          <Quick href="/admin/products/pending" label="Review products" />
          <Quick href="/admin/refunds" label="Process refunds" />
          <Quick href="/admin/fraud" label="Fraud queue" />
        </div>
      </Section>
    </DashboardShell>
  );
}

function Quick({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/30 hover:bg-[color:var(--muted)] p-4 text-sm font-medium transition-colors"
    >
      {label} <span className="text-[color:var(--fg-muted)]">→</span>
    </Link>
  );
}

function parseRange(sp: { from?: string; to?: string; range?: string }) {
  const now = new Date();
  if (sp.range === "7d") return { from: new Date(now.getTime() - 7 * 86400000), to: now };
  if (sp.range === "90d") return { from: new Date(now.getTime() - 90 * 86400000), to: now };
  if (sp.range === "ytd") return { from: new Date(now.getFullYear(), 0, 1), to: now };
  if (sp.from && sp.to) return { from: new Date(sp.from), to: new Date(sp.to) };
  return undefined;
}
