import { requireUser } from "@/src/lib/auth/guards";
import { affiliatesRepo, payoutsRepo } from "@/src/lib/repos/misc";
import { formatMoney } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";
import { defaultConfig } from "@/src/lib/config/platform";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { affiliateNav } from "@/src/components/dashboard/affiliateNav";

function nextMonthlyPayout(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

export default async function AffiliatePayouts() {
  const session = await requireUser();
  const aff = affiliatesRepo.byUserId(session.uid);
  const payouts = payoutsRepo
    .byRecipient(session.uid)
    .filter((p) => p.recipientType === "affiliate")
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  const next = nextMonthlyPayout();
  const threshold = defaultConfig.affiliatePayoutThresholdCents;
  return (
    <DashboardShell
      eyebrow="Affiliate"
      title="Affiliate payouts"
      description={`Monthly payouts run on the 1st when your balance crosses ${formatMoney(threshold)}.`}
      nav={affiliateNav}
      active="/affiliate/payouts"
    >
      {aff && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-xl border border-[color:var(--brand-500)]/30 bg-[color:var(--card)] p-6">
            <div className="absolute inset-0 gradient-mesh opacity-50" aria-hidden />
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[color:var(--brand-500)]/15 blur-3xl pointer-events-none" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--fg-muted)] font-medium">
                Pending balance
              </p>
              <p className="font-serif-display text-5xl tracking-tight gradient-text mt-2">
                {formatMoney(aff.pendingCommissionsCents)}
              </p>
              <p className="text-xs text-[color:var(--fg-muted)] mt-3">
                Lifetime earnings: {formatMoney(aff.totalEarningsCents)}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--fg-muted)] font-medium">
              Next payout
            </p>
            <p className="font-serif-display text-3xl tracking-tight mt-2">
              {next.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <div className="mt-5 pt-4 border-t border-[color:var(--border)]">
              <Badge variant={aff.pendingCommissionsCents >= threshold ? "success" : "warn"}>
                {aff.pendingCommissionsCents >= threshold
                  ? "Eligible"
                  : `Need ${formatMoney(threshold - aff.pendingCommissionsCents)} more`}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <Section title="Payout history" hint={`${payouts.length} total`}>
        {payouts.length === 0 ? (
          <EmptyState
            title="No payouts yet"
            description="Your first payout will appear here once you cross the threshold."
          />
        ) : (
          <ul className="divide-y divide-[color:var(--border)] -mx-1">
            {payouts.map((p) => (
              <li key={p.id} className="px-1 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">
                    {new Date(p.scheduledDate).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </p>
                  <p className="text-xs text-[color:var(--fg-muted)] mt-0.5 font-mono">
                    {p.commissionIds?.length ?? 0} commission{(p.commissionIds?.length ?? 0) === 1 ? "" : "s"} · {p.id.slice(0, 12)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={
                    p.status === "completed" ? "success" :
                    p.status === "failed" ? "destructive" : "warn"
                  }>
                    {p.status}
                  </Badge>
                  <span className="font-semibold tracking-tight tabular-nums">
                    {formatMoney(p.amountCents)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </DashboardShell>
  );
}
