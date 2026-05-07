import { requireRole } from "@/src/lib/auth/guards";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { TIERS } from "@/src/lib/config/tiers";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { sellerNav } from "@/src/components/dashboard/sellerNav";
import { SubscriptionTiers } from "./SubscriptionTiers";

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: { ok?: string; failed?: string; err?: string; plan?: string };
}) {
  const session = await requireRole("seller");
  const sub = subsRepo.byUserId(session.uid);
  const requestedPlan =
    searchParams.plan && searchParams.plan in TIERS ? searchParams.plan : undefined;
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
          {searchParams.err ? (
            <>
              Checkout failed: <code className="font-mono text-xs">{searchParams.err}</code>
            </>
          ) : (
            "Payment failed. Update your method in Paddle."
          )}
        </div>
      )}

      <SubscriptionTiers
        currentTier={sub?.tier}
        customerEmail={session.email}
        autoOpen={requestedPlan as any}
      />

      <div className="rounded-2xl border border-dashed border-[color:var(--border)] p-8 text-center text-sm text-[color:var(--fg-muted)]">
        Custom needs? Talk to us about volume pricing and revenue-share deals at{" "}
        <a className="underline text-[color:var(--fg)]" href="mailto:hello@plinth.dev">
          hello@plinth.dev
        </a>
        .
      </div>
    </DashboardShell>
  );
}
