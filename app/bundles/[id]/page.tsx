import { notFound } from "next/navigation";
import { bundlesRepo } from "@/src/lib/repos/misc";
import { productsRepo } from "@/src/lib/repos/products";
import { usersRepo } from "@/src/lib/repos/users";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";
import { AddBundleButton } from "./AddBundleButton";
import Link from "next/link";
import { Package, Download, ShieldCheck, RefreshCcw } from "lucide-react";

export default function BundleDetail({ params }: { params: { id: string } }) {
  const bundle = bundlesRepo.byId(params.id) as any;
  if (!bundle || bundle.status !== "active") notFound();
  const seller = usersRepo.byId(bundle.sellerId);
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 grid lg:grid-cols-[1fr_360px] gap-10">
      <div>
        <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-transparent border border-[color:var(--border)] mb-8 flex items-center justify-center">
          <Package className="w-16 h-16 text-[color:var(--fg-muted)]/40" />
        </div>
        <Badge className="mb-3 bg-black/80 text-white border-none">
          Bundle of {bundle.products.length}
        </Badge>
        <h1 className="font-serif-display text-5xl leading-[1.05] tracking-tight text-balance mb-4">
          {bundle.title}
        </h1>
        <p className="text-[color:var(--fg-muted)] mb-8 whitespace-pre-line">{bundle.description}</p>

        <h2 className="font-serif-display text-2xl mb-4">Included products</h2>
        <ul className="space-y-3">
          {bundle.products.map((p: any) => {
            const product = productsRepo.byId(p.productId);
            return (
              <li key={p.productId}>
                <Link
                  href={`/products/${p.productId}`}
                  className="flex items-center gap-4 rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] p-4 hover:border-[color:var(--border-strong)] transition-colors"
                >
                  <span className="grid place-items-center h-12 w-12 rounded-md bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 font-mono text-xs uppercase tracking-widest text-[color:var(--fg-muted)] shrink-0">
                    {(product?.productType ?? "bin").slice(0, 3).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{p.title}</p>
                    <p className="text-xs text-[color:var(--fg-muted)] line-clamp-1">
                      {product?.description?.slice(0, 80) ?? ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatMoney(p.individualPriceCents)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="lg:sticky lg:top-24 self-start space-y-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[color:var(--fg-muted)] mb-1">Bundle price</p>
              <div className="flex items-baseline gap-3">
                <span className="font-serif-display text-5xl tracking-tight">
                  {formatMoney(bundle.bundlePriceCents)}
                </span>
                {bundle.savingsCents > 0 && (
                  <span className="text-base text-[color:var(--fg-muted)] line-through">
                    {formatMoney(bundle.individualTotalCents)}
                  </span>
                )}
              </div>
              {bundle.savingsCents > 0 && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  Save {formatMoney(bundle.savingsCents)} ({Math.round(bundle.savingsPercentage)}%)
                </p>
              )}
            </div>
            <AddBundleButton bundleId={bundle.id} />
            <ul className="text-xs text-[color:var(--fg-muted)] space-y-1.5 pt-2 border-t border-[color:var(--border)]">
              <li className="flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Instant download</li>
              <li className="flex items-center gap-2"><RefreshCcw className="w-3.5 h-3.5" /> 30-day window</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Paddle merchant of record</li>
            </ul>
          </CardContent>
        </Card>
        {seller && (
          <Card>
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-widest text-[color:var(--fg-muted)] mb-2">Sold by</p>
              <p className="font-medium">{seller.sellerProfile?.businessName ?? seller.name}</p>
              <p className="text-xs text-[color:var(--fg-muted)] line-clamp-2 mt-1">{seller.sellerProfile?.description}</p>
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  );
}
