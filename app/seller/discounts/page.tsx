import { requireRole } from "@/src/lib/auth/guards";
import { discountsRepo } from "@/src/lib/repos/misc";
import { DiscountForm } from "./DiscountForm";
import { formatMoney } from "@/src/lib/utils";
import { productsRepo } from "@/src/lib/repos/products";
import { Badge } from "@/src/components/ui/badge";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { sellerNav } from "@/src/components/dashboard/sellerNav";

export default async function DiscountsPage() {
  const session = await requireRole("seller");
  const codes = discountsRepo.bySeller(session.uid);
  const products = productsRepo.bySeller(session.uid);
  const totalRevenue = codes.reduce((s, c) => s + c.totalRevenueCents, 0);
  const totalUses = codes.reduce((s, c) => s + c.currentUses, 0);
  return (
    <DashboardShell
      eyebrow="Seller studio"
      title="Discount codes"
      description={`${codes.length} code${codes.length === 1 ? "" : "s"} · ${totalUses} use${totalUses === 1 ? "" : "s"} · ${formatMoney(totalRevenue)} attributed revenue.`}
      nav={sellerNav(session.uid)}
      active="/seller/discounts"
    >
      <Section title="Create new code">
        <DiscountForm products={products.map((p) => ({ id: p.id, title: p.title }))} />
      </Section>

      <Section title="Existing codes" hint={`${codes.length} total`}>
        {codes.length === 0 ? (
          <EmptyState title="No codes yet" description="Run a promo by giving customers a code." />
        ) : (
          <ul className="divide-y divide-[color:var(--border)] -mx-1">
            {codes.map((c) => (
              <li key={c.id} className="px-1 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <code className="bg-[color:var(--muted)] px-2 py-0.5 rounded font-mono text-sm">
                    {c.code}
                  </code>
                  <p className="text-xs text-[color:var(--fg-muted)] mt-1">
                    {c.discountType === "percentage" ? `${c.discountValue}% off` : `${formatMoney(c.discountValue)} off`}
                    {" · valid "}
                    {new Date(c.startDate).toLocaleDateString()} → {new Date(c.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p>
                    <span className="font-semibold tabular-nums text-[color:var(--fg)]">{c.currentUses}</span>
                    {c.maxUses && <span className="text-[color:var(--fg-muted)]"> / {c.maxUses}</span>}
                    <span className="text-[color:var(--fg-muted)]"> uses</span>
                  </p>
                  <p className="text-[color:var(--fg-muted)] tabular-nums">
                    {formatMoney(c.totalRevenueCents)} revenue
                  </p>
                </div>
                <Badge variant={c.isActive ? "success" : "outline"}>
                  {c.isActive ? "Active" : "Inactive"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </DashboardShell>
  );
}
