import { requireRole } from "@/src/lib/auth/guards";
import { payoutsRepo } from "@/src/lib/repos/misc";
import { ordersRepo } from "@/src/lib/repos/orders";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";
import { defaultConfig } from "@/src/lib/config/platform";

function nextWeeklyPayoutDate(): Date {
  // Friday of this week, or next Friday
  const d = new Date();
  const day = d.getDay(); // 0 sun..6 sat
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
    <div className="mx-auto max-w-4xl py-12 px-6 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] mb-1">
          Studio · Payouts
        </p>
        <h1 className="font-serif-display text-4xl tracking-tight">Earnings</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="text-xs uppercase tracking-widest text-[color:var(--fg-muted)]">Pending balance</p>
            <p className="font-serif-display text-5xl tracking-tight gradient-text">
              {formatMoney(pendingNet)}
            </p>
            <div className="text-xs text-[color:var(--fg-muted)] space-y-1 pt-3 border-t border-[color:var(--border)]">
              <Row label="Gross sales" value={formatMoney(pendingGross)} />
              <Row label={`Platform fee (${sub?.commissionRate ?? 10}%)`} value={`−${formatMoney(pendingCommission)}`} />
              <Row label="Your net" value={formatMoney(pendingNet)} bold />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="text-xs uppercase tracking-widest text-[color:var(--fg-muted)]">Next payout</p>
            <p className="font-serif-display text-3xl tracking-tight">
              {next.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <div className="pt-3 border-t border-[color:var(--border)]">
              <Badge variant={aboveThreshold ? "success" : "warn"}>
                {aboveThreshold
                  ? "Eligible — payout will run"
                  : `Need ${formatMoney(threshold - pendingNet)} more`}
              </Badge>
              <p className="text-xs text-[color:var(--fg-muted)] mt-2">
                Payouts run weekly when balance ≥ {formatMoney(threshold)}.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Payout history</h3>
          {payouts.length === 0 ? (
            <p className="text-sm text-[color:var(--fg-muted)]">No payouts yet.</p>
          ) : (
            <ul className="divide-y divide-[color:var(--border)]">
              {payouts.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">
                      {new Date(p.scheduledDate).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </p>
                    <p className="text-xs text-[color:var(--fg-muted)] mt-0.5">
                      {(p.orderIds?.length ?? 0)} order{(p.orderIds?.length ?? 0) === 1 ? "" : "s"} · ID {p.id.slice(0, 12)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      p.status === "completed" ? "success" :
                      p.status === "failed" ? "destructive" : "warn"
                    }>
                      {p.status}
                    </Badge>
                    <span className="font-semibold tracking-tight tabular-nums">{formatMoney(p.amountCents)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-[color:var(--fg)]" : ""}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
