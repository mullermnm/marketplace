import { requireRole } from "@/src/lib/auth/guards";
import { ordersRepo } from "@/src/lib/repos/orders";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { adminNav } from "@/src/components/dashboard/adminNav";

export default async function FraudPage() {
  await requireRole("admin");
  const flagged = ordersRepo.flagged().filter((o) => o.fraudFlags && o.fraudFlags.length > 0);
  return (
    <DashboardShell
      eyebrow="Console"
      title="Fraud queue"
      description={`${flagged.length} flagged transaction${flagged.length === 1 ? "" : "s"} awaiting review.`}
      nav={adminNav()}
      active="/admin/fraud"
    >
      {flagged.length === 0 ? (
        <EmptyState
          title="Nothing flagged"
          description="Risk scoring runs on every checkout. Suspicious orders will appear here."
        />
      ) : (
        <div className="space-y-3">
          {flagged.map((o) => (
            <Section key={o.id} className={(o.fraudScore ?? 0) >= 50 ? "border-rose-500/40 bg-rose-500/5" : "border-amber-500/40 bg-amber-500/5"}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <Link href={`/orders/${o.id}`} className="font-mono text-sm hover:underline">
                    {o.id.slice(0, 16)}
                  </Link>
                  <p className="text-xs text-[color:var(--fg-muted)] mt-1">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={(o.fraudScore ?? 0) >= 50 ? "destructive" : "warn"}>
                    <ShieldAlert className="w-3 h-3 mr-1 inline" /> score {o.fraudScore ?? 0}
                  </Badge>
                  <span className="font-semibold tracking-tight">{formatMoney(o.totalCents)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs mb-4">
                {o.fraudFlags?.map((f) => (
                  <span key={f} className="rounded-full bg-[color:var(--muted)] px-2 py-0.5 font-mono">
                    {f}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 pt-3 border-t border-[color:var(--border)]">
                <form action="/api/admin/fraud/approve" method="post">
                  <input type="hidden" name="orderId" value={o.id} />
                  <Button type="submit" variant="primary" size="sm">Approve order</Button>
                </form>
                <form action="/api/admin/fraud/reject" method="post">
                  <input type="hidden" name="orderId" value={o.id} />
                  <Button type="submit" variant="destructive" size="sm">Reject & refund</Button>
                </form>
              </div>
            </Section>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
