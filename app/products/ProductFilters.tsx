"use client";

import { useRouter } from "next/navigation";
import { CategoryDoc } from "@/src/lib/repos/categories";
import { Input, Label } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

export function ProductFilters({
  categories,
  initial,
}: {
  categories: CategoryDoc[];
  initial: Record<string, string | undefined>;
}) {
  const r = useRouter();
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    Array.from(fd.entries()).forEach(([k, v]) => {
      if (v && String(v).length > 0) params.set(k, String(v));
    });
    r.push(`/products?${params.toString()}`);
  }
  return (
    <Card>
      <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3 text-sm">
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
            <Label htmlFor="minRating">Min rating</Label>
            <Input id="minRating" name="minRating" type="number" step={0.5} min={0} max={5} defaultValue={initial.minRating ?? ""} />
          </div>
          <div>
            <Label htmlFor="type">File type</Label>
            <select id="type" name="type" defaultValue={initial.type ?? ""} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
              <option value="">Any</option>
              {["pdf","video","audio","software","image","3d_model","document","other"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <select id="category" name="category" defaultValue={initial.category ?? ""} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
              <option value="">Any</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{"  ".repeat(c.level)}{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="sort">Sort</Label>
            <select id="sort" name="sort" defaultValue={initial.sort ?? ""} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
              <option value="">Default</option>
              <option value="trending">Trending</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <Button type="submit" className="w-full">Apply</Button>
        </form>
      </CardContent>
    </Card>
  );
}
