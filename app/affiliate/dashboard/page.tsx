import { requireUser } from "@/src/lib/auth/guards";
import { affiliatesRepo, AffiliateDoc } from "@/src/lib/repos/misc";
import { productsRepo } from "@/src/lib/repos/products";
import { Button } from "@/src/components/ui/button";
import { formatMoney } from "@/src/lib/utils";
import Link from "next/link";
import { Sparkles, Copy } from "lucide-react";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { StatTile } from "@/src/components/dashboard/Stats";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { affiliateNav } from "@/src/components/dashboard/affiliateNav";
import { ReferralLinkBuilder } from "./ReferralLinkBuilder";
import { defaultConfig } from "@/src/lib/config/platform";

export default async function AffiliateDashboard() {
  const session = await requireUser();
  const aff = affiliatesRepo.byUserId(session.uid);

  if (!aff) {
    return (
      <DashboardShell
        eyebrow="Affiliate"
        title="Earn 10% on every referred sale"
        description="Generate a link, share it anywhere, get paid monthly when your balance crosses $100."
        nav={affiliateNav}
        active="/affiliate/dashboard"
      >
        <Section>
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <p className="font-serif-display text-2xl tracking-tight mb-2">
                Become a Plinth affiliate
              </p>
              <p className="text-sm text-[color:var(--fg-muted)] max-w-md">
                Get a unique tracking link for any product. Earn {defaultConfig.affiliateCommissionRate}% commission on every purchase. Set cookie duration up to 90 days.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-[color:var(--fg-muted)]">
                <li>· {defaultConfig.affiliateCommissionRate}% commission on referred sales</li>
                <li>· Choose 30, 60, or 90-day cookie window</li>
                <li>· Monthly payouts via Paddle (≥ {formatMoney(defaultConfig.affiliatePayoutThresholdCents)})</li>
              </ul>
            </div>
            <form action="/api/affiliate/register" method="post">
              <Button type="submit" variant="primary" size="lg">
                <Sparkles className="w-4 h-4" /> Register as affiliate
              </Button>
            </form>
          </div>
        </Section>
      </DashboardShell>
    );
  }

  const totalClicks = aff.referralLinks.reduce((s, l) => s + l.clicks, 0);
  const totalConv = aff.referralLinks.reduce((s, l) => s + l.conversions, 0);
  const convRate = totalClicks > 0 ? (totalConv / totalClicks) * 100 : 0;

  return (
    <DashboardShell
      eyebrow="Affiliate"
      title="Referrals & earnings"
      description={`Earning ${defaultConfig.affiliateCommissionRate}% on every sale you refer.`}
      nav={affiliateNav}
      active="/affiliate/dashboard"
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/affiliate/payouts">View payouts</Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Total earned" value={formatMoney(aff.totalEarningsCents)} highlight />
        <StatTile label="Pending" value={formatMoney(aff.pendingCommissionsCents)} hint="next payout" />
        <StatTile label="Clicks" value={totalClicks} />
        <StatTile label="Conversion" value={`${convRate.toFixed(1)}%`} hint={`${totalConv} sales`} />
      </div>

      <ReferralLinkBuilder affiliateId={aff.affiliateId} />

      <Section title="Your links" hint="Click counts update in real time">
        {aff.referralLinks.length === 0 ? (
          <EmptyState
            title="No clicks yet"
            description="Share your link to start tracking. Use the builder above to copy any product link."
          />
        ) : (
          <ul className="divide-y divide-[color:var(--border)] -mx-1">
            {aff.referralLinks.map((l) => {
              const p = productsRepo.byId(l.productId);
              const cr = l.clicks > 0 ? (l.conversions / l.clicks) * 100 : 0;
              return (
                <li key={l.productId} className="px-1 py-3 flex items-center gap-3">
                  <span className="grid place-items-center h-9 w-9 rounded-md bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 font-mono text-[10px] uppercase tracking-widest text-[color:var(--fg-muted)] shrink-0">
                    {(p?.productType ?? "bin").slice(0, 3).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${l.productId}`} className="text-sm font-medium hover:underline line-clamp-1">
                      {p?.title ?? l.productId}
                    </Link>
                    <p className="text-xs text-[color:var(--fg-muted)] mt-0.5">
                      {l.clicks} click{l.clicks === 1 ? "" : "s"} · {l.conversions} conv · {cr.toFixed(1)}% CR
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums text-sm">{formatMoney(l.revenueCents)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Tips for earning more">
        <ul className="text-sm text-[color:var(--fg-muted)] space-y-1.5">
          <li>· Pick products you'd recommend anyway. Authenticity converts.</li>
          <li>· Share inside niche communities, not blasts.</li>
          <li>· Pair links with reviews or short-form videos.</li>
        </ul>
      </Section>
    </DashboardShell>
  );
}
