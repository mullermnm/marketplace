import Link from "next/link";
import { getSession } from "@/src/lib/auth/session";
import { Button } from "@/src/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { ShoppingCart, LayoutGrid } from "lucide-react";

export async function Header() {
  const session = await getSession();
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-4">
        <Link href="/" className="font-bold text-lg flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          DigiMart
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/products" className="hover:text-foreground">Browse</Link>
          <Link href="/products?sort=trending" className="hover:text-foreground">Trending</Link>
          {session?.role === "seller" && (
            <Link href="/seller/dashboard" className="hover:text-foreground">Seller</Link>
          )}
          {session?.role === "admin" && (
            <Link href="/admin/dashboard" className="hover:text-foreground">Admin</Link>
          )}
          {session && (
            <Link href="/affiliate/dashboard" className="hover:text-foreground">
              Affiliate
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/cart" aria-label="Cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </Link>
          <ThemeToggle />
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm hidden sm:block">
                {session.name}
              </Link>
              <form action="/api/auth/logout" method="post">
                <Button variant="outline" size="sm">Logout</Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
