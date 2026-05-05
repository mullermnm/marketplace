import { requireRole } from "@/src/lib/auth/guards";
import { usersRepo } from "@/src/lib/repos/users";
import { Button } from "@/src/components/ui/button";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { adminNav } from "@/src/components/dashboard/adminNav";

export default async function PendingSellersPage() {
  await requireRole("admin");
  const pending = usersRepo.bySellerStatus("pending_approval");
  return (
    <DashboardShell
      eyebrow="Console"
      title="Seller approvals"
      description={`${pending.length} pending application${pending.length === 1 ? "" : "s"}.`}
      nav={adminNav()}
      active="/admin/sellers/pending"
    >
      {pending.length === 0 ? (
        <EmptyState title="Inbox zero" description="All caught up. New applications will appear here." />
      ) : (
        <div className="space-y-3">
          {pending.map((u) => (
            <Section key={u.id}>
              <div className="flex items-start gap-4">
                <span className="grid place-items-center h-12 w-12 rounded-full bg-gradient-to-br from-[color:var(--brand-500)] to-[color:var(--brand-700)] text-white font-semibold text-lg">
                  {(u.sellerProfile?.businessName ?? u.name).charAt(0).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-serif-display text-2xl tracking-tight">
                    {u.sellerProfile?.businessName}
                  </p>
                  <p className="text-sm text-[color:var(--fg-muted)] mt-1">
                    {u.sellerProfile?.description}
                  </p>
                  <p className="text-xs text-[color:var(--fg-muted)] mt-2 font-mono">
                    {u.email} · contact {u.sellerProfile?.contactEmail}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[color:var(--border)]">
                <form action="/api/admin/sellers/approve" method="post">
                  <input type="hidden" name="userId" value={u.id} />
                  <Button type="submit" variant="primary" size="sm">Approve</Button>
                </form>
                <form action="/api/admin/sellers/reject" method="post" className="flex gap-2 flex-1 max-w-md">
                  <input type="hidden" name="userId" value={u.id} />
                  <input
                    name="reason"
                    placeholder="Reason for rejection"
                    required
                    className="flex-1 h-9 rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3 text-sm focus-visible:outline-none focus-visible:border-[color:var(--brand-500)]"
                  />
                  <Button type="submit" variant="destructive" size="sm">Reject</Button>
                </form>
              </div>
            </Section>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
