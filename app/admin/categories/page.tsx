import { requireRole } from "@/src/lib/auth/guards";
import { categoriesRepo } from "@/src/lib/repos/categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

export default async function AdminCategories() {
  await requireRole("admin");
  const cats = categoriesRepo.all();
  return (
    <div className="mx-auto max-w-3xl py-8 px-4 space-y-4">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <Card>
        <CardHeader><CardTitle>Add category</CardTitle></CardHeader>
        <CardContent>
          <form action="/api/admin/categories" method="post" className="grid grid-cols-3 gap-2 text-sm">
            <input name="name" placeholder="Name" required className="h-9 rounded border border-border bg-background px-3" />
            <select name="parentId" className="h-9 rounded border border-border bg-background px-3">
              <option value="">— root —</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.path}</option>)}
            </select>
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>
      <ul className="space-y-1 text-sm">
        {cats.map((c) => (
          <li key={c.id} className="flex justify-between border-b border-border pb-1">
            <span>{"  ".repeat(c.level)}{c.name} <span className="text-muted-foreground text-xs">({c.productCount})</span></span>
            {c.productCount === 0 && (
              <form action="/api/admin/categories/delete" method="post">
                <input type="hidden" name="id" value={c.id} />
                <Button size="sm" variant="ghost" type="submit">Delete</Button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
