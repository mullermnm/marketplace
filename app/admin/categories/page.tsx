import { requireRole } from "@/src/lib/auth/guards";
import { categoriesRepo, CategoryDoc } from "@/src/lib/repos/categories";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input, Label } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";

export default async function AdminCategories() {
  await requireRole("admin");
  const cats = categoriesRepo.all();
  const roots = cats.filter((c) => !c.parentId);
  return (
    <div className="mx-auto max-w-4xl py-12 px-6 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] mb-1">
          Console
        </p>
        <h1 className="font-serif-display text-4xl tracking-tight">Categories</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Add category</h3>
          <form action="/api/admin/categories" method="post" className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 text-sm">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="parentId">Parent</Label>
              <select
                id="parentId"
                name="parentId"
                className="h-10 w-full rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3 text-sm"
              >
                <option value="">— root —</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.path}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="primary" type="submit" className="w-full sm:w-auto">Add</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Tree</h3>
          {roots.length === 0 ? (
            <p className="text-sm text-[color:var(--fg-muted)]">No categories yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {roots.map((root) => (
                <CatRow key={root.id} cat={root} all={cats} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CatRow({ cat, all }: { cat: CategoryDoc; all: CategoryDoc[] }) {
  const children = all.filter((c) => c.parentId === cat.id);
  return (
    <li>
      <div className="flex items-center gap-2 py-1.5 group">
        <span className="font-medium">{cat.name}</span>
        <Badge variant="outline" className="text-[10px]">{cat.productCount}</Badge>
        <details className="ml-auto">
          <summary className="cursor-pointer text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] list-none">Edit</summary>
          <form action="/api/admin/categories/update" method="post" className="mt-2 flex gap-2">
            <input type="hidden" name="id" value={cat.id} />
            <Input name="name" defaultValue={cat.name} className="h-8 text-xs" />
            <Button size="sm" type="submit">Save</Button>
          </form>
        </details>
        {cat.productCount === 0 && (
          <form action="/api/admin/categories/delete" method="post" className="ml-2">
            <input type="hidden" name="id" value={cat.id} />
            <Button size="sm" variant="ghost" type="submit" className="text-[color:var(--fg-muted)] hover:text-[color:var(--destructive)]">
              Delete
            </Button>
          </form>
        )}
      </div>
      {children.length > 0 && (
        <ul className="ml-4 border-l border-[color:var(--border)] pl-4 space-y-1">
          {children.map((c) => <CatRow key={c.id} cat={c} all={all} />)}
        </ul>
      )}
    </li>
  );
}
