import Link from "next/link";
import { productsRepo } from "@/src/lib/repos/products";
import { ProductCard } from "@/src/components/shared/ProductCard";
import { Button } from "@/src/components/ui/button";

export default function Home() {
  const trending = productsRepo.trending(8);
  const featured = productsRepo.featured(4);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-12">
      <section className="rounded-xl border border-border p-10 text-center bg-gradient-to-b from-muted to-background">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
          Discover digital products from creators worldwide
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          PDFs, software, courses, audio, 3D models — buy instantly, download right away.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/products"><Button size="lg">Browse marketplace</Button></Link>
          <Link href="/seller/onboarding"><Button size="lg" variant="outline">Become a seller</Button></Link>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold">Trending</h2>
          <Link href="/products?sort=trending" className="text-sm text-muted-foreground">View all</Link>
        </div>
        {trending.length === 0 ? (
          <p className="text-muted-foreground text-sm">No products yet — try logging in as the demo seller and adding one.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trending.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {featured.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Featured</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-border p-6 bg-muted/40">
        <h3 className="font-semibold mb-2">Demo accounts</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><code>admin@local.dev</code> / <code>Admin123!</code></li>
          <li><code>seller@local.dev</code> / <code>Seller123!</code></li>
          <li><code>customer@local.dev</code> / <code>Customer123!</code></li>
        </ul>
      </section>
    </div>
  );
}
