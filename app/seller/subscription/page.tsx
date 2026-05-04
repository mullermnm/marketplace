import { requireRole } from "@/src/lib/auth/guards";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { TIERS, TIER_ORDER } from "@/src/lib/config/tiers";
import { Button } from "@/src/components/ui/button";
import { formatMoney } from "@/src/lib/utils";
import { Check } from "lucide-react";

const FEATURES: Record<string, string[]> = {
  free_trial: [
    "5 products",
    "5 GB storage",
    "10% platform fee",
    "Standard analytics",
  ],
  basic: [
    "50 products",
    "50 GB storage",
    "7% platform fee",
    "Standard analytics",
    "Discount codes",
  ],
  pro: [
    "500 products",
    "500 GB storage",
    "5% platform fee",
    "Advanced analytics",
    "Customer demographics",
    "Priority email support",
  ],
  enterprise: [
    "Unlimited products",
    "2 TB storage",
    "3% platform fee",
    "Advanced analytics + cohorts",
    "Custom commission rates",
    "Dedicated CSM",
  ],
};

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: { ok?: string; failed?: string };
}) {
  const session = await requireRole("seller");
  const sub = subsRepo.byUserId(session.uid);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] mb-2">
          Pricing
        </p>
        <h1 className="font-serif-display text-5xl tracking-tight text-balance">
          Pick the plan that fits your storefront
        </h1>
        <p className="mt-4 text-[color:var(--fg-muted)]">
          You're currently on <b className="text-[color:var(--fg)]">{TIERS[sub?.tier ?? "free_trial"].name}</b>
          {sub?.status && sub.status !== "active" && <span className="ml-2 text-amber-500">({sub.status})</span>}.
          Switch any time.
        </p>
        {searchParams.ok && (
          <p className="mt-4 inline-block rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-xs">
            ✓ Subscription updated
          </p>
        )}
        {searchParams.failed && (
          <p className="mt-4 inline-block rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 px-3 py-1 text-xs">
            Payment failed
          </p>
        )}
      </div>

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
              <form
                action="/api/seller/subscription/checkout"
                method="post"
                className="mt-6"
              >
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

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-8 text-center text-sm text-[color:var(--fg-muted)]">
        Custom needs? Talk to us about volume pricing and revenue-share deals.{" "}
        <a className="underline text-[color:var(--fg)]" href="mailto:hello@plinth.dev">hello@plinth.dev</a>
      </div>
    </div>
  );
}
