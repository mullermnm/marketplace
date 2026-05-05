import { requireRole } from "@/src/lib/auth/guards";
import { usersRepo } from "@/src/lib/repos/users";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { adminNav } from "@/src/components/dashboard/adminNav";

export default async function AdminSellers() {
  await requireRole("admin");
  const sellers = usersRepo.all().filter((u) => u.role === "seller" || u.sellerProfile);
  return (
    <DashboardShell
      eyebrow="Console"
      title="Sellers"
      description={`${sellers.length} seller account${sellers.length === 1 ? "" : "s"} on the platform.`}
      nav={adminNav()}
      active="/admin/sellers"
    >
      {sellers.length === 0 ? (
        <EmptyState title="No sellers yet" />
      ) : (
        <div className="space-y-3">
          {sellers.map((u) => {
            const sub = subsRepo.byUserId(u.id);
            return (
              <Section key={u.id}>
                <div className="flex flex-wrap items-start gap-4">
                  <span className="grid place-items-center h-11 w-11 rounded-full bg-gradient-to-br from-[color:var(--brand-500)] to-[color:var(--brand-700)] text-white text-sm font-semibold shrink-0">
                    {(u.sellerProfile?.businessName ?? u.name).charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">
                        {u.sellerProfile?.businessName ?? u.name}
                      </p>
                      <Badge variant={
                        u.sellerProfile?.status === "approved" ? "success" :
                        u.sellerProfile?.status === "banned" || u.sellerProfile?.status === "suspended" ? "destructive" : "warn"
                      }>
                        {u.sellerProfile?.status ?? "no profile"}
                      </Badge>
                      {sub && <Badge variant="outline">{sub.tier}</Badge>}
                      {u.sellerProfile?.customCommissionRate != null && (
                        <Badge>{u.sellerProfile.customCommissionRate}% custom</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[color:var(--fg-muted)] font-mono mt-1">{u.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[color:var(--border)]">
                  <form action="/api/admin/sellers/suspend" method="post">
                    <input type="hidden" name="userId" value={u.id} />
                    <Button size="sm" variant="outline" type="submit">Suspend</Button>
                  </form>
                  <form action="/api/admin/sellers/ban" method="post">
                    <input type="hidden" name="userId" value={u.id} />
                    <Button size="sm" variant="destructive" type="submit">Ban</Button>
                  </form>
                  <form action="/api/admin/sellers/commission" method="post" className="flex gap-2 ml-auto">
                    <input type="hidden" name="userId" value={u.id} />
                    <input
                      name="rate"
                      type="number"
                      step={0.1}
                      min={0}
                      max={50}
                      placeholder="rate %"
                      className="h-8 w-24 rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-2 text-xs focus-visible:outline-none focus-visible:border-[color:var(--brand-500)]"
                    />
                    <Button size="sm" type="submit">Set rate</Button>
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
