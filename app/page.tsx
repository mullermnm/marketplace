import Link from "next/link";
import { productsRepo } from "@/src/lib/repos/products";
import { ProductCard } from "@/src/components/shared/ProductCard";
import { Button } from "@/src/components/ui/button";
import { Aurora } from "@/src/components/fx/Aurora";
import { Marquee } from "@/src/components/fx/Marquee";
import { TIERS } from "@/src/lib/config/tiers";
import { formatMoney } from "@/src/lib/utils";
import { ArrowRight, Sparkles, ShieldCheck, Zap, BarChart3, Globe, Code2 } from "lucide-react";

export default function Home() {
  const trending = productsRepo.trending(8);
  const featured = productsRepo.featured(4);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <Aurora />
        <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32">
          <div className="flex justify-center mb-6">
            <Link
              href="/products?sort=trending"
              className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card)]/60 px-3 py-1 text-xs text-[color:var(--fg-muted)] backdrop-blur"
            >
              <span className="grid h-1.5 w-1.5 place-items-center rounded-full bg-[color:var(--brand-500)] animate-pulse" />
              New in marketplace · 30+ creators added this week
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <h1 className="text-center font-serif-display text-balance text-5xl md:text-7xl leading-[1.05] tracking-tight">
            The marketplace for{" "}
            <span className="gradient-text italic">digital makers</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-[color:var(--fg-muted)] text-pretty">
            Templates, software, courses, audio, 3D models. Buy in one click, download instantly,
            keep what you bought — forever.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild variant="primary" size="xl">
              <Link href="/products">Discover the catalog</Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link href="/seller/onboarding">
                Start selling
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-[color:var(--fg-muted)]">
            <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Paddle merchant of record</span>
            <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Instant downloads</span>
            <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Sell worldwide, tax-handled</span>
          </div>
        </div>

        {/* trust marquee */}
        <div className="border-y border-[color:var(--border)] py-8">
          <p className="mb-4 text-center text-xs uppercase tracking-widest text-[color:var(--fg-muted)]">
            Powered by industry leaders
          </p>
          <Marquee>
            {["Paddle", "SendGrid", "Next.js", "MongoDB", "Tailwind", "Vercel", "Cloudflare", "Stripe"].map((b) => (
              <span key={b} className="text-2xl font-semibold tracking-tight text-[color:var(--fg-muted)]/70">
                {b}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* TRENDING / FEATURED */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] mb-2">
              Trending now
            </p>
            <h2 className="font-serif-display text-4xl tracking-tight">
              What people are buying this week
            </h2>
          </div>
          <Link href="/products?sort=trending" className="hidden sm:inline-flex items-center gap-1 text-sm text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]">
            See all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {trending.length === 0 ? (
          <EmptyCatalog />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* BENTO */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-xs uppercase tracking-widest text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] mb-2 text-center">
          Why creators ship on Plinth
        </p>
        <h2 className="font-serif-display text-4xl text-center tracking-tight mb-12 text-balance">
          Built like a product, not a checkout form.
        </h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 lg:grid-rows-2 auto-rows-[180px]">
          <BentoCard
            className="lg:col-span-2 lg:row-span-2"
            icon={<Sparkles className="w-5 h-5" />}
            title="Storefront in minutes"
            blurb="Drag a file in, set a price, hit publish. We handle invoicing, tax, downloads, license keys, refunds — all of it."
            big
          />
          <BentoCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="Real analytics"
            blurb="Conversion, top products, traffic sources, customer cohorts."
          />
          <BentoCard
            icon={<Zap className="w-5 h-5" />}
            title="Instant payouts"
            blurb="Weekly seller payouts, monthly affiliate payouts. No spreadsheets."
          />
          <BentoCard
            icon={<Code2 className="w-5 h-5" />}
            title="License keys"
            blurb="Software products auto-generate unique 25-char license keys with a validation API."
          />
          <BentoCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Fraud handled"
            blurb="Risk-scored orders go to a manual queue. Paddle handles disputes."
          />
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] mb-2">
                Editor's picks
              </p>
              <h2 className="font-serif-display text-4xl tracking-tight">Featured creators</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* PRICING TEASER */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-xs uppercase tracking-widest text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] mb-2 text-center">
          Plans that scale with you
        </p>
        <h2 className="font-serif-display text-4xl text-center tracking-tight mb-12 text-balance">
          Start free. Scale to enterprise. Keep more of every sale.
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          {Object.values(TIERS).map((t, i) => {
            const popular = i === 2;
            const cta =
              t.id === "free_trial"
                ? "Start free →"
                : t.id === "enterprise"
                ? "Talk to sales →"
                : "Choose this plan →";
            return (
              <Link
                key={t.id}
                href={`/seller/subscription?plan=${t.id}`}
                className={`group block rounded-xl border p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-md)] ${popular ? "gradient-border border-transparent bg-[color:var(--card)]" : "border-[color:var(--border)] bg-[color:var(--card)] hover:border-[color:var(--border-strong)]"}`}
              >
                {popular && (
                  <span className="mb-2 inline-block text-[10px] uppercase tracking-widest font-semibold text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)]">
                    Most popular
                  </span>
                )}
                <h3 className="font-serif-display text-2xl">{t.name}</h3>
                <p className="mt-1 text-3xl font-semibold tracking-tight">
                  {formatMoney(t.monthlyPriceCents)}
                  <span className="text-sm font-normal text-[color:var(--fg-muted)]">/mo</span>
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-[color:var(--fg-muted)]">
                  <li>{t.commissionRate}% platform fee</li>
                  <li>{t.productLimit === -1 ? "Unlimited" : t.productLimit} products</li>
                  <li>{t.storageLimitGB}GB storage</li>
                </ul>
                <p className="mt-5 pt-4 border-t border-[color:var(--border)] text-sm font-medium text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] group-hover:translate-x-0.5 transition-transform">
                  {cta}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] p-12 text-center gradient-mesh">
          <h2 className="font-serif-display text-4xl tracking-tight text-balance">
            Ready to put your work behind a checkout?
          </h2>
          <p className="mt-3 text-[color:var(--fg-muted)]">
            Free trial. No credit card. Approved within a day.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/seller/onboarding">Become a seller</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/products">Browse first</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* DEV CREDS */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="rounded-xl border border-dashed border-[color:var(--border)] p-5 text-xs text-[color:var(--fg-muted)]">
          <p className="font-semibold mb-1.5 text-[color:var(--fg)]">Demo credentials</p>
          <div className="grid gap-1 font-mono">
            <span><b>Admin</b> · admin@local.dev / Admin123!</span>
            <span><b>Seller</b> · seller@local.dev / Seller123!</span>
            <span><b>Customer</b> · customer@local.dev / Customer123!</span>
          </div>
        </div>
      </section>
    </>
  );
}

function BentoCard({
  icon, title, blurb, big = false, className = "",
}: { icon: React.ReactNode; title: string; blurb: string; big?: boolean; className?: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 lift ${className}`}>
      {big && (
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[color:var(--brand-500)]/15 blur-3xl" aria-hidden />
      )}
      <div className="relative">
        <span className="inline-grid place-items-center h-9 w-9 rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)]">
          {icon}
        </span>
        <h3 className={`mt-4 font-semibold tracking-tight ${big ? "text-2xl font-serif-display" : "text-base"}`}>
          {title}
        </h3>
        <p className={`mt-1.5 text-sm text-[color:var(--fg-muted)] ${big ? "max-w-md" : ""}`}>
          {blurb}
        </p>
      </div>
    </div>
  );
}

function EmptyCatalog() {
  return (
    <div className="rounded-xl border border-dashed border-[color:var(--border)] p-12 text-center">
      <p className="text-sm text-[color:var(--fg-muted)]">
        No products listed yet. Log in as the demo seller, create one, then approve as admin.
      </p>
    </div>
  );
}
