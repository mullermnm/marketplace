import { productsRepo } from "@/src/lib/repos/products";
import { categoriesRepo } from "@/src/lib/repos/categories";
import { ProductCard } from "@/src/components/shared/ProductCard";
import { BundleCard } from "@/src/components/shared/BundleCard";
import { ProductFilters } from "./ProductFilters";
import { bundlesRepo } from "@/src/lib/repos/misc";

type SP = Record<string, string | undefined>;

export default function ProductsPage({ searchParams }: { searchParams: SP }) {
  const minP = searchParams.minPrice ? parseInt(searchParams.minPrice) * 100 : undefined;
  const maxP = searchParams.maxPrice ? parseInt(searchParams.maxPrice) * 100 : undefined;
  const minR = searchParams.minRating ? parseFloat(searchParams.minRating) : undefined;
  let results = productsRepo.search({
    q: searchParams.q,
    minPrice: minP,
    maxPrice: maxP,
    minRating: minR,
    productType: searchParams.type as any,
    categoryId: searchParams.category,
  });
  if (searchParams.sort === "trending") {
    results = [...results].sort((a, b) => b.purchaseCount - a.purchaseCount);
  } else if (searchParams.sort === "newest") {
    results = [...results].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  const cats = categoriesRepo.all();
  const bundles =
    !searchParams.q && !searchParams.minPrice && !searchParams.maxPrice && !searchParams.type
      ? bundlesRepo.active().slice(0, 4)
      : [];
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] mb-2">
          Browse
        </p>
        <h1 className="font-serif-display text-5xl tracking-tight text-balance">
          {searchParams.q
            ? `Results for "${searchParams.q}"`
            : "Every digital product, in one place"}
        </h1>
        <p className="mt-3 text-[color:var(--fg-muted)]">
          {results.length} item{results.length !== 1 && "s"} match
          {results.length === 1 ? "es" : ""} your filters
          {bundles.length > 0 && ` · ${bundles.length} bundle${bundles.length !== 1 ? "s" : ""}`}.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 self-start">
          <ProductFilters categories={cats} initial={searchParams} />
        </aside>
        <section className="space-y-12">
          {bundles.length > 0 && (
            <div>
              <div className="flex items-end justify-between mb-4">
                <h2 className="font-serif-display text-2xl tracking-tight">Featured bundles</h2>
                <span className="text-xs text-[color:var(--fg-muted)] uppercase tracking-widest">Save more</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {bundles.map((b) => <BundleCard key={b.id} bundle={b as any} />)}
              </div>
            </div>
          )}
          <div>
            {bundles.length > 0 && (
              <h2 className="font-serif-display text-2xl tracking-tight mb-4">All products</h2>
            )}
            {results.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[color:var(--border)] p-16 text-center">
                <p className="text-[color:var(--fg-muted)]">No matches. Try clearing filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {results.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
