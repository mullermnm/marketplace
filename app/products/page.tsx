import { productsRepo } from "@/src/lib/repos/products";
import { categoriesRepo } from "@/src/lib/repos/categories";
import { ProductCard } from "@/src/components/shared/ProductCard";
import { ProductFilters } from "./ProductFilters";

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
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
      <aside>
        <ProductFilters categories={cats} initial={searchParams} />
      </aside>
      <section>
        <h1 className="text-2xl font-semibold mb-4">
          {results.length} product{results.length !== 1 && "s"}
        </h1>
        {results.length === 0 ? (
          <p className="text-muted-foreground">No matches. Try clearing filters.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
