import Link from "next/link";
import { Logo } from "@/src/components/fx/Logo";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] mt-24">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-[color:var(--fg-muted)] leading-relaxed">
            The marketplace for digital makers. Sell what you create — anything that ships in a file.
          </p>
        </div>
        <Col title="Marketplace" links={[
          ["Discover", "/products"],
          ["Trending", "/products?sort=trending"],
          ["Categories", "/products"],
          ["Affiliate", "/affiliate/dashboard"],
        ]} />
        <Col title="For sellers" links={[
          ["Become a seller", "/seller/onboarding"],
          ["Pricing", "/seller/subscription"],
          ["Studio", "/seller/dashboard"],
        ]} />
        <Col title="Account" links={[
          ["Log in", "/login"],
          ["Sign up", "/register"],
          ["Orders", "/orders"],
        ]} />
      </div>
      <div className="border-t border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row justify-between gap-4 text-xs text-[color:var(--fg-muted)]">
          <p>© {new Date().getFullYear()} Plinth Inc. All rights reserved.</p>
          <p>Made for digital creators · Built on the Digital Products Marketplace spec</p>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold tracking-widest uppercase text-[color:var(--fg-muted)] mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm">
        {links.map(([t, h]) => (
          <li key={h}>
            <Link href={h} className="hover:text-[color:var(--fg)] text-[color:var(--fg-muted)] transition-colors">
              {t}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
