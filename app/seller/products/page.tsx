import { requireRole } from "@/src/lib/auth/guards";
import { productsRepo } from "@/src/lib/repos/products";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";
import { Plus, Edit3 } from "lucide-react";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { sellerNav } from "@/src/components/dashboard/sellerNav";

export default async function SellerProductsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await requireRole("seller");
  let products = productsRepo.bySeller(session.uid);
  const filter = searchParams.status;
  if (filter) products = products.filter((p) => p.status === filter);
  products = [...products].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const counts = {
    active: productsRepo.bySeller(session.uid).filter((p) => p.status === "active").length,
    pending_review: productsRepo.bySeller(session.uid).filter((p) => p.status === "pending_review").length,
    rejected: productsRepo.bySeller(session.uid).filter((p) => p.status === "rejected").length,
  };
  return (
    <DashboardShell
      eyebrow="Seller studio"
      title="Your products"
      description={`${productsRepo.bySeller(session.uid).length} listed across all states.`}
      nav={sellerNav(session.uid)}
      active={filter ? "/seller/products?status=pending" : "/seller/products"}
      actions={
        <Button asChild variant="primary" size="sm">
          <Link href="/seller/products/new">
            <Plus className="w-3.5 h-3.5" /> New product
          </Link>
        </Button>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        <FilterPill label="All" href="/seller/products" active={!filter} />
        <FilterPill label={`Active · ${counts.active}`} href="/seller/products?status=active" active={filter === "active"} />
        <FilterPill label={`Pending · ${counts.pending_review}`} href="/seller/products?status=pending_review" active={filter === "pending_review"} />
        <FilterPill label={`Rejected · ${counts.rejected}`} href="/seller/products?status=rejected" active={filter === "rejected"} />
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Create your first product to start selling."
          action={
            <Button asChild variant="primary" size="sm">
              <Link href="/seller/products/new"><Plus className="w-3.5 h-3.5" /> New product</Link>
            </Button>
          }
        />
      ) : (
        <Section>
          <ul className="divide-y divide-[color:var(--border)] -mx-1">
            {products.map((p) => (
              <li key={p.id} className="px-1 py-3 flex items-center gap-3">
                <span className="grid place-items-center h-11 w-11 rounded-md bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 font-mono text-[10px] uppercase tracking-widest text-[color:var(--fg-muted)] shrink-0">
                  {p.productType.slice(0, 3).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${p.id}`} className="text-sm font-medium hover:underline line-clamp-1">
                    {p.title}
                  </Link>
                  <p className="text-xs text-[color:var(--fg-muted)] mt-0.5 font-mono">
                    v{p.currentVersion} · {p.purchaseCount} sold · {p.viewCount} views
                  </p>
                </div>
                <Badge variant={p.status === "active" ? "success" : p.status === "rejected" ? "destructive" : "warn"}>
                  {p.status.replace("_", " ")}
                </Badge>
                <span className="font-semibold tracking-tight tabular-nums w-20 text-right">
                  {formatMoney(p.priceCents)}
                </span>
                <Link href={`/seller/products/${p.id}/edit`} className="text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] inline-flex items-center gap-1">
                  <Edit3 className="w-3 h-3" /> Edit
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </DashboardShell>
  );
}

function FilterPill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs transition-colors ${active ? "bg-[color:var(--fg)] text-[color:var(--bg)]" : "border border-[color:var(--border)] text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--muted)]"}`}
    >
      {label}
    </Link>
  );
}
