import { requireRole } from "@/src/lib/auth/guards";
import { productsRepo } from "@/src/lib/repos/products";
import { usersRepo } from "@/src/lib/repos/users";
import { Button } from "@/src/components/ui/button";
import { formatMoney } from "@/src/lib/utils";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { adminNav } from "@/src/components/dashboard/adminNav";

export default async function PendingProducts() {
  await requireRole("admin");
  const list = productsRepo.byStatus("pending_review");
  return (
    <DashboardShell
      eyebrow="Console"
      title="Product approval queue"
      description={`${list.length} product${list.length === 1 ? "" : "s"} awaiting moderation.`}
      nav={adminNav()}
      active="/admin/products/pending"
    >
      {list.length === 0 ? (
        <EmptyState
          title="Queue is empty"
          description="All caught up. New submissions will land here for review."
        />
      ) : (
        <div className="space-y-3">
          {list.map((p) => {
            const seller = usersRepo.byId(p.sellerId);
            return (
              <Section key={p.id}>
                <div className="flex items-start gap-4">
                  <span className="grid place-items-center h-12 w-12 rounded-md bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 font-mono text-[10px] uppercase tracking-widest text-[color:var(--fg-muted)] shrink-0">
                    {p.productType.slice(0, 3).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="font-serif-display text-2xl tracking-tight">
                        {p.title}
                      </p>
                      <span className="font-semibold tracking-tight">
                        {formatMoney(p.priceCents)}
                      </span>
                    </div>
                    <p className="text-xs text-[color:var(--fg-muted)] mt-1 font-mono">
                      by {seller?.sellerProfile?.businessName ?? seller?.name} · {p.files.length} file{p.files.length === 1 ? "" : "s"}
                    </p>
                    <p className="text-sm text-[color:var(--fg-muted)] mt-3 whitespace-pre-line line-clamp-4">
                      {p.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[color:var(--border)]">
                  <form action="/api/admin/products/approve" method="post">
                    <input type="hidden" name="productId" value={p.id} />
                    <Button type="submit" variant="primary" size="sm">Approve</Button>
                  </form>
                  <form action="/api/admin/products/feature" method="post">
                    <input type="hidden" name="productId" value={p.id} />
                    <Button type="submit" variant="outline" size="sm">Approve & feature</Button>
                  </form>
                  <form action="/api/admin/products/reject" method="post" className="flex gap-2 flex-1 max-w-md ml-auto">
                    <input type="hidden" name="productId" value={p.id} />
                    <input
                      name="reason"
                      placeholder="Rejection reason"
                      required
                      className="flex-1 h-9 rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3 text-sm focus-visible:outline-none focus-visible:border-[color:var(--brand-500)]"
                    />
                    <Button type="submit" variant="destructive" size="sm">Reject</Button>
                  </form>
                </div>
              </Section>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
