"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export function MobileMenu({ loggedIn, role }: { loggedIn: boolean; role?: "customer" | "seller" | "admin" }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="md:hidden inline-grid place-items-center h-9 w-9 rounded-md hover:bg-[color:var(--muted)]"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      {open && (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <nav className="relative bg-[color:var(--card)] border-b border-[color:var(--border)] p-6 space-y-1">
            <Item href="/products" onClick={() => setOpen(false)}>Discover</Item>
            <Item href="/products?sort=trending" onClick={() => setOpen(false)}>Trending</Item>
            <Item href="/seller/onboarding" onClick={() => setOpen(false)}>Sell</Item>
            {role === "seller" && <Item href="/seller/dashboard" onClick={() => setOpen(false)}>Studio</Item>}
            {role === "admin" && <Item href="/admin/dashboard" onClick={() => setOpen(false)}>Console</Item>}
            {loggedIn && <Item href="/affiliate/dashboard" onClick={() => setOpen(false)}>Affiliate</Item>}
            {loggedIn && <Item href="/orders" onClick={() => setOpen(false)}>Orders</Item>}
            <div className="pt-3 mt-3 border-t border-[color:var(--border)] flex flex-col gap-2">
              {loggedIn ? (
                <form action="/api/auth/logout" method="post">
                  <Button variant="outline" className="w-full">Sign out</Button>
                </form>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button variant="primary" className="w-full">Get started</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

function Item({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2.5 rounded-md text-base hover:bg-[color:var(--muted)] transition-colors"
    >
      {children}
    </Link>
  );
}
