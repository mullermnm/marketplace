import { requireRole } from "@/src/lib/auth/guards";
import { payoutsRepo } from "@/src/lib/repos/misc";
import { ordersRepo } from "@/src/lib/repos/orders";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";
import { defaultConfig } from "@/src/lib/config/platform";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { sellerNav } from "@/src/components/dashboard/sellerNav";

function nextWeeklyPayoutDate(): Date {
  const d = new Date();
  const day = d.getDay();
  const daysUntilFri = (5 - day + 7) % 7 || 7;
  const next = new Date(d);
  next.setDate(d.getDate() + daysUntilFri);
  next.setHours(0, 0, 0, 0);
  return next;
}

export default async function PayoutsPage() {
  const session = await requireRole("seller");
  const sub = subsRepo.byUserId(session.uid);
  const payouts = payoutsRepo.byRecipient(session.uid).sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime(),
  );
  const orders = ordersRepo.bySeller(session.uid).filter((o) => o.paymentStatus === "completed");
  const paidOrderIds = new Set(payouts.flatMap((p) => p.orderIds ?? []));
  let pendingNet = 0;
  let pendingGross = 0;
  let pendingCommission = 0;
  for (const o of orders) {
    if (paidOrderIds.has(o.id)) continue;
    for (const i of o.items) {
      if (i.sellerId === session.uid && !i.refunded) {
        pendingNet += i.sellerPayoutCents;
        pendingGross += i.priceCents;
        pendingCommission += i.commissionCents;
      }
    }
  }
  const threshold = defaultConfig.sellerPayoutThresholdCents;
  const aboveThreshold = pendingNet >= threshold;
  const next = nextWeeklyPayoutDate();
  return (
    <DashboardShell
      eyebrow="Seller studio"
      title="Earnings & payouts"
      description="Weekly payouts run automatically when your balance crosses the threshold."
      nav={sellerNav(session.uid)}
      active="/seller/payouts"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-xl border border-[color:var(--brand-500)]/30 bg-[color:var(--card)] p-6">
          <div className="absolute inset-0 gradient-mesh opacity-50" aria-hidden />
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[color:var(--brand-500)]/15 blur-3xl pointer-events-none" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--fg-muted)] font-medium">
              Pending balance
            </p>
            <p className="font-serif-display text-5xl tracking-tight gradient-text mt-2">
              {formatMoney(pendingNet)}
            </p>
            <div className="mt-5 space-y-1.5 pt-4 border-t border-[color:var(--border)] text-xs">
              <Row label="Gross sales" value={formatMoney(pendingGross)} />
              <Row label={`Platform fee · ${sub?.commissionRate ?? 10}%`} value={`−${formatMoney(pendingCommission)}`} />
              <div className="border-t border-[color:var(--border)] pt-1.5 mt-1.5">
                <Row label="Your net" value={formatMoney(pendingNet)} bold />
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--fg-muted)] font-medium">
            Next payout
          </p>
          <p className="font-serif-display text-3xl tracking-tight mt-2">
            {next.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <div className="mt-5 pt-4 border-t border-[color:var(--border)]">
            <Badge variant={aboveThreshold ? "success" : "warn"}>
              {aboveThreshold
                ? "Eligible — payout will run"
                : `Need ${formatMoney(threshold - pendingNet)} more`}
            </Badge>
            <p className="text-xs text-[color:var(--fg-muted)] mt-3">
              Payouts run every Friday once balance ≥ {formatMoney(threshold)}. Funds typically land in 1–2 business days.
            </p>
          </div>
        </div>
      </div>

      <Section title="Payout history" hint={`${payouts.length} total`}>
        {payouts.length === 0 ? (
          <EmptyState title="No payouts yet" description="Your first payout will appear here once you cross the threshold." />
        ) : (
          <ul className="divide-y divide-[color:var(--border)] -mx-1">
            {payouts.map((p) => (
              <li key={p.id} className="px-1 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">
                    {new Date(p.scheduledDate).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </p>
                  <p className="text-xs text-[color:var(--fg-muted)] mt-0.5 font-mono">
                    {(p.orderIds?.length ?? 0)} order{(p.orderIds?.length ?? 0) === 1 ? "" : "s"} · {p.id.slice(0, 12)}
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

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-[color:var(--fg)]" : "text-[color:var(--fg-muted)]"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
