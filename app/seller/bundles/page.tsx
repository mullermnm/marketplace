import { requireRole } from "@/src/lib/auth/guards";
import { bundlesRepo } from "@/src/lib/repos/misc";
import { productsRepo } from "@/src/lib/repos/products";
import { BundleForm } from "./BundleForm";
import { formatMoney } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";
import Link from "next/link";
import { Package } from "lucide-react";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { sellerNav } from "@/src/components/dashboard/sellerNav";

export default async function BundlesPage() {
  const session = await requireRole("seller");
  const bundles = bundlesRepo.bySeller(session.uid);
  const products = productsRepo.bySeller(session.uid).filter((p) => p.status === "active");
  return (
    <DashboardShell
      eyebrow="Seller studio"
      title="Bundles"
      description="Sell multiple products together at a discounted price. Buyers see the savings on listings."
      nav={sellerNav(session.uid)}
      active="/seller/bundles"
    >
      <Section title="Create bundle" hint={`Pick ≥2 of your active products. ${products.length} eligible.`}>
        {products.length < 2 ? (
          <EmptyState
            title="You need at least 2 active products"
            description="Add and get-approved on a couple before creating bundles."
          />
        ) : (
          <BundleForm
            products={products.map((p) => ({ id: p.id, title: p.title, priceCents: p.priceCents }))}
          />
        )}
      </Section>

      <Section title="Existing bundles" hint={`${bundles.length} total`}>
        {bundles.length === 0 ? (
          <EmptyState title="No bundles yet" />
        ) : (
          <ul className="divide-y divide-[color:var(--border)] -mx-1">
            {bundles.map((b) => (
              <li key={b.id} className="px-1 py-3 flex items-center gap-3">
                <span className="grid place-items-center h-11 w-11 rounded-md bg-gradient-to-br from-amber-500/20 to-rose-500/10 shrink-0">
                  <Package className="w-4 h-4 text-[color:var(--fg-muted)]" />
                </span>
                <div className="flex-1 min-w-0">
                  <Link href={`/bundles/${b.id}`} className="text-sm font-medium hover:underline line-clamp-1">
                    {b.title}
                  </Link>
                  <p className="text-xs text-[color:var(--fg-muted)] mt-0.5">
                    {b.products.length} products · {b.purchaseCount} sold
                  </p>
                </div>
                <Badge variant={b.status === "active" ? "success" : "outline"}>
                  {b.status}
                </Badge>
                <span className="text-right">
                  <span className="font-semibold tabular-nums">{formatMoney(b.bundlePriceCents)}</span>
                  {b.savingsCents > 0 && (
                    <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">
                      saves {formatMoney(b.savingsCents)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </DashboardShell>
  );
}
