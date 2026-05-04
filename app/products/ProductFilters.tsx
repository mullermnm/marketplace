"use client";

import { useRouter } from "next/navigation";
import { CategoryDoc } from "@/src/lib/repos/categories";
import { Input, Label } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

const FILE_TYPES = ["pdf", "video", "audio", "software", "image", "3d_model", "document", "other"];

export function ProductFilters({
  categories,
  initial,
}: {
  categories: CategoryDoc[];
  initial: Record<string, string | undefined>;
}) {
  const r = useRouter();
  const roots = categories.filter((c) => !c.parentId);

  function buildHref(patch: Partial<Record<string, string>>) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(initial)) {
      if (v) next.set(k, String(v));
    }
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    return `/products?${next.toString()}`;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    Array.from(fd.entries()).forEach(([k, v]) => {
      if (v && String(v).length > 0) params.set(k, String(v));
    });
    r.push(`/products?${params.toString()}`);
  }

  const activeFilters = Object.entries(initial).filter(
    ([k, v]) => v && k !== "sort",
  );

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4 text-sm">
        <div>
          <Label htmlFor="q">Search</Label>
          <Input id="q" name="q" defaultValue={initial.q ?? ""} placeholder="Title or description" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="minPrice">Min $</Label>
            <Input id="minPrice" name="minPrice" type="number" min={0} defaultValue={initial.minPrice ?? ""} />
          </div>
          <div>
            <Label htmlFor="maxPrice">Max $</Label>
            <Input id="maxPrice" name="maxPrice" type="number" min={0} defaultValue={initial.maxPrice ?? ""} />
          </div>
        </div>
        <div>
          <Label>Min rating</Label>
          <div className="flex gap-1.5">
            {[0, 3, 4, 4.5].map((n) => (
              <label key={n} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="minRating"
                  value={n || ""}
                  defaultChecked={String(initial.minRating ?? "") === String(n || "")}
                  className="sr-only peer"
                />
                <span className="block text-center py-1.5 rounded-md border border-[color:var(--border)] bg-[color:var(--card)] text-xs peer-checked:border-[color:var(--brand-500)] peer-checked:bg-[color:var(--brand-500)]/10 peer-checked:text-[color:var(--brand-700)] dark:peer-checked:text-[color:var(--brand-300)]">
                  {n === 0 ? "Any" : `≥${n}★`}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="type">File type</Label>
          <select
            id="type"
            name="type"
            defaultValue={initial.type ?? ""}
            className="w-full h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3 text-sm focus-visible:outline-none focus-visible:border-[color:var(--brand-500)]"
          >
            <option value="">Any format</option>
            {FILE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="sort">Sort by</Label>
          <select
            id="sort"
            name="sort"
            defaultValue={initial.sort ?? ""}
            className="w-full h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3 text-sm focus-visible:outline-none focus-visible:border-[color:var(--brand-500)]"
          >
            <option value="">Relevance</option>
            <option value="trending">Trending</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        <input type="hidden" name="category" value={initial.category ?? ""} />
        <Button type="submit" variant="primary" className="w-full">Apply filters</Button>
      </form>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeFilters.map(([k, v]) => (
            <Link
              key={k}
              href={buildHref({ [k]: undefined })}
              className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--muted)] px-2.5 py-1 text-xs"
            >
              <span className="text-[color:var(--fg-muted)]">{k}:</span>
              <span>{v}</span>
              <span className="text-[color:var(--fg-muted)]">×</span>
            </Link>
          ))}
          <Link href="/products" className="inline-flex items-center text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] underline underline-offset-4 px-2">
            Clear all
          </Link>
        </div>
      )}

      {categories.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-[color:var(--fg-muted)] mb-3">Categories</p>
          <ul className="space-y-1 text-sm">
            {roots.map((root) => (
              <CategoryNode
                key={root.id}
                cat={root}
                all={categories}
                activeId={initial.category}
                buildHref={buildHref}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CategoryNode({
  cat,
  all,
  activeId,
  buildHref,
}: {
  cat: CategoryDoc;
  all: CategoryDoc[];
  activeId?: string;
  buildHref: (patch: Partial<Record<string, string>>) => string;
}) {
  const children = all.filter((c) => c.parentId === cat.id);
  const isActive = activeId === cat.id;
  return (
    <li>
      <Link
        href={buildHref({ category: isActive ? undefined : cat.id })}
        className={`block py-1 px-2 -mx-2 rounded-md text-[13px] transition-colors ${isActive ? "bg-[color:var(--brand-500)]/10 text-[color:var(--brand-700)] dark:text-[color:var(--brand-300)] font-medium" : "text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--muted)]"}`}
      >
        {cat.name}
        {cat.productCount > 0 && (
          <span className="ml-2 text-[10px] tabular-nums text-[color:var(--fg-muted)]">
            {cat.productCount}
          </span>
        )}
      </Link>
      {children.length > 0 && (
        <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-[color:var(--border)] pl-3">
          {children.map((c) => (
            <CategoryNode key={c.id} cat={c} all={all} activeId={activeId} buildHref={buildHref} />
          ))}
        </ul>
      )}
    </li>
  );
}
