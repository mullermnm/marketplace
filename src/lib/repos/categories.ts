import { store } from "../db/store";
import { newId } from "../ids";

export interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  level: number;
  path: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const categoriesRepo = {
  create(input: { name: string; description?: string; parentId?: string | null }) {
    const now = new Date().toISOString();
    const parent = input.parentId ? this.byId(input.parentId) : null;
    const slug = slugify(input.name);
    const doc: CategoryDoc = {
      id: newId("cat"),
      name: input.name,
      slug,
      description: input.description ?? "",
      parentId: input.parentId ?? null,
      level: parent ? parent.level + 1 : 0,
      path: parent ? `${parent.path}/${slug}` : slug,
      productCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    return store.categories.insert(doc);
  },
  byId(id: string): CategoryDoc | null {
    return store.categories.findById(id);
  },
  all(): CategoryDoc[] {
    return store.categories.find((c: CategoryDoc) => c.isActive);
  },
  children(parentId: string | null): CategoryDoc[] {
    return this.all().filter((c) => c.parentId === parentId);
  },
  update(id: string, patch: Partial<CategoryDoc>) {
    return store.categories.update(id, patch);
  },
  delete(id: string) {
    return store.categories.remove(id);
  },
  bumpProductCount(id: string, delta: number) {
    const c = this.byId(id);
    if (c) this.update(id, { productCount: c.productCount + delta });
  },
};
