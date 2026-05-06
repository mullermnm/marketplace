import { requireRole } from "@/src/lib/auth/guards";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { TIERS, TIER_ORDER } from "@/src/lib/config/tiers";
import { Button } from "@/src/components/ui/button";
import { formatMoney } from "@/src/lib/utils";
import { Check } from "lucide-react";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { sellerNav } from "@/src/components/dashboard/sellerNav";

const FEATURES: Record<string, string[]> = {
  free_trial: ["5 products", "5 GB storage", "10% platform fee", "Standard analytics"],
  basic: ["50 products", "50 GB storage", "7% platform fee", "Standard analytics", "Discount codes"],
  pro: ["500 products", "500 GB storage", "5% platform fee", "Advanced analytics", "Customer demographics", "Priority email support"],
  enterprise: ["Unlimited products", "2 TB storage", "3% platform fee", "Advanced analytics + cohorts", "Custom commission rates", "Dedicated CSM"],
};

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: { ok?: string; failed?: string; err?: string };
}) {
  const session = await requireRole("seller");
  const sub = subsRepo.byUserId(session.uid);
  return (
    <DashboardShell
      eyebrow="Seller studio"
      title="Your plan"
      description={`Currently on ${TIERS[sub?.tier ?? "free_trial"].name}${sub?.status && sub.status !== "active" ? ` · ${sub.status}` : ""}. Switch any time — proration handled by Paddle.`}
      nav={sellerNav(session.uid)}
      active="/seller/subscription"
    >
      {searchParams.ok && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
          ✓ Subscription updated
        </div>
      )}
      {searchParams.failed && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
          {searchParams.err
            ? <>Checkout failed: <code className="font-mono text-xs">{searchParams.err}</code></>
            : "Payment failed. Update your method in Paddle."}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-4">
        {TIER_ORDER.map((id, i) => {
          const t = TIERS[id];
          const isCurrent = sub?.tier === id;
          const popular = i === 2;
          return (
            <div
              key={id}
              className={`relative rounded-2xl p-6 transition-all ${
                popular
                  ? "gradient-border bg-[color:var(--card)] -translate-y-2 lg:scale-[1.02]"
                  : "border border-[color:var(--border)] bg-[color:var(--card)] hover:border-[color:var(--border-strong)]"
              }`}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--brand-600)] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-serif-display text-2xl tracking-tight">{t.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">
                  {formatMoney(t.monthlyPriceCents)}
                </span>
                <span className="text-sm text-[color:var(--fg-muted)]">/mo</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {FEATURES[id].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] shrink-0" />
                    <span className="text-[color:var(--fg-muted)]">{f}</span>
                  </li>
                ))}
              </ul>
              <form action="/api/seller/subscription/checkout" method="post" className="mt-6">
                <input type="hidden" name="tierId" value={id} />
                <Button
                  type="submit"
                  variant={popular ? "primary" : "outline"}
                  className="w-full"
                  disabled={isCurrent}
                >
                  {isCurrent ? "Current plan" : id === "free_trial" ? "Switch to free" : "Choose"}
                </Button>
              </form>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-dashed border-[color:var(--border)] p-8 text-center text-sm text-[color:var(--fg-muted)]">
        Custom needs? Talk to us about volume pricing and revenue-share deals at{" "}
        <a className="underline text-[color:var(--fg)]" href="mailto:hello@plinth.dev">hello@plinth.dev</a>.
      </div>
    </DashboardShell>
  );
}
