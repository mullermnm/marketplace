import Link from "next/link";
import { getSession } from "@/src/lib/auth/session";
import { Button } from "@/src/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "@/src/components/fx/Logo";
import { ShoppingBag, Search } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { HeaderSearch } from "./HeaderSearch";

export async function Header() {
  const session = await getSession();
  return (
    <>
      <a
        href="#main"
        className="absolute left-2 top-2 -translate-y-12 focus:translate-y-0 z-50 rounded-md bg-[color:var(--fg)] text-[color:var(--bg)] px-3 py-1.5 text-sm transition-transform"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-[color:var(--border)] glass">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center gap-6">
          <Link href="/" aria-label="Plinth home" className="shrink-0">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-[0.9rem] text-[color:var(--fg-muted)]">
            <Link href="/products" className="hover:text-[color:var(--fg)] transition-colors">Discover</Link>
            <Link href="/products?sort=trending" className="hover:text-[color:var(--fg)] transition-colors">Trending</Link>
            <Link href="/seller/onboarding" className="hover:text-[color:var(--fg)] transition-colors">Sell</Link>
            {session?.role === "seller" && (
              <Link href="/seller/dashboard" className="hover:text-[color:var(--fg)] transition-colors">Studio</Link>
            )}
            {session?.role === "admin" && (
              <Link href="/admin/dashboard" className="hover:text-[color:var(--fg)] transition-colors">Console</Link>
            )}
          </nav>
          <HeaderSearch />
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link href="/cart" aria-label="Cart">
              <Button variant="ghost" size="icon">
                <ShoppingBag className="w-[18px] h-[18px]" />
              </Button>
            </Link>
            <ThemeToggle />
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center gap-2 text-sm text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] transition-colors pl-1"
                  aria-label={`${session.name} account`}
                >
                  <span className="grid place-items-center h-7 w-7 rounded-full bg-gradient-to-br from-[color:var(--brand-500)] to-[color:var(--brand-700)] text-white text-xs font-semibold">
                    {session.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden lg:inline">{session.name}</span>
                </Link>
                <form action="/api/auth/logout" method="post" className="hidden sm:block">
                  <Button variant="outline" size="sm">Sign out</Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-block">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/register" className="hidden sm:inline-block">
                  <Button variant="primary" size="sm">Get started</Button>
                </Link>
              </>
            )}
            <MobileMenu loggedIn={!!session} role={session?.role} />
          </div>
        </div>
      </header>
    </>
  );
}
