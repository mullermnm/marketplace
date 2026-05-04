"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export function HeaderSearch() {
  const r = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) r.push(`/products?q=${encodeURIComponent(q.trim())}`);
      }}
      className="hidden lg:flex items-center gap-2 ml-2 flex-1 max-w-sm relative"
    >
      <Search className="absolute left-3 w-3.5 h-3.5 text-[color:var(--fg-muted)] pointer-events-none" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search the marketplace…"
        aria-label="Search products"
        className="h-9 w-full rounded-md border border-[color:var(--border)] bg-[color:var(--muted)]/50 pl-9 pr-3 text-sm placeholder:text-[color:var(--fg-muted)] focus-visible:outline-none focus-visible:border-[color:var(--brand-500)] focus-visible:bg-[color:var(--card)] transition-colors"
      />
      <kbd className="absolute right-3 hidden xl:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border border-[color:var(--border)] text-[color:var(--fg-muted)] font-mono pointer-events-none">
        ⏎
      </kbd>
    </form>
  );
}
