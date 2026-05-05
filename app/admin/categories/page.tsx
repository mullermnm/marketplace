import { requireRole } from "@/src/lib/auth/guards";
import { categoriesRepo, CategoryDoc } from "@/src/lib/repos/categories";
import { Button } from "@/src/components/ui/button";
import { Input, Label } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { Section, EmptyState } from "@/src/components/dashboard/Section";
import { adminNav } from "@/src/components/dashboard/adminNav";

export default async function AdminCategories() {
  await requireRole("admin");
  const cats = categoriesRepo.all();
  const roots = cats.filter((c) => !c.parentId);
  return (
    <DashboardShell
      eyebrow="Console"
      title="Categories"
      description="Organize your catalog. Hierarchical, with per-category counts."
      nav={adminNav()}
      active="/admin/categories"
    >
      <Section title="Add category">
        <form
          action="/api/admin/categories"
          method="post"
          className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
        >
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="parentId">Parent</Label>
            <select
              id="parentId"
              name="parentId"
              className="h-10 w-full rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3 text-sm focus-visible:outline-none focus-visible:border-[color:var(--brand-500)]"
            >
              <option value="">— root —</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.path}</option>)}
            </select>
          </div>
          <Button variant="primary" type="submit">Add category</Button>
        </form>
      </Section>

      <Section title="Tree" hint={`${cats.length} total`}>
        {roots.length === 0 ? (
          <EmptyState title="No categories yet" description="Add a root to get started." />
        ) : (
          <ul className="space-y-1">
            {roots.map((root) => <CatRow key={root.id} cat={root} all={cats} />)}
          </ul>
        )}
      </Section>
    </DashboardShell>
  );
}

function CatRow({ cat, all }: { cat: CategoryDoc; all: CategoryDoc[] }) {
  const children = all.filter((c) => c.parentId === cat.id);
  return (
    <li>
      <div className="flex items-center gap-2 py-1.5 group rounded-md hover:bg-[color:var(--muted)]/40 px-2">
        <span className="font-medium text-sm">{cat.name}</span>
        <Badge variant="outline" className="text-[10px]">{cat.productCount}</Badge>
        <details className="ml-auto">
          <summary className="cursor-pointer text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] list-none select-none">
            Edit
          </summary>
          <form action="/api/admin/categories/update" method="post" className="mt-2 flex gap-2">
            <input type="hidden" name="id" value={cat.id} />
            <Input name="name" defaultValue={cat.name} className="h-8 text-xs" />
            <Button size="sm" type="submit">Save</Button>
          </form>
        </details>
        {cat.productCount === 0 && (
          <form action="/api/admin/categories/delete" method="post">
            <input type="hidden" name="id" value={cat.id} />
            <Button
              size="sm"
              variant="ghost"
              type="submit"
              className="text-[color:var(--fg-muted)] hover:text-[color:var(--destructive)]"
            >
              Delete
            </Button>
          </form>
        )}
      </div>
      {children.length > 0 && (
        <ul className="ml-4 border-l border-[color:var(--border)] pl-3 space-y-1">
          {children.map((c) => <CatRow key={c.id} cat={c} all={all} />)}
        </ul>
      )}
    </li>
  );
}
