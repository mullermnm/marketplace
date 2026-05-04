import { notFound } from "next/navigation";
import { productsRepo } from "@/src/lib/repos/products";
import { usersRepo } from "@/src/lib/repos/users";
import { reviewsRepo } from "@/src/lib/repos/misc";
import { RatingStars } from "@/src/components/shared/RatingStars";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { ReviewSection } from "./ReviewSection";
import { getSession } from "@/src/lib/auth/session";
import { ordersRepo } from "@/src/lib/repos/orders";
import { Download, ShieldCheck, RefreshCcw, Key } from "lucide-react";

const TYPE_GLYPH: Record<string, string> = {
  pdf: "PDF", video: "MP4", audio: "WAV", software: "EXE",
  image: "PNG", "3d_model": "GLB", document: "DOC", other: "BIN",
};

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const product = productsRepo.byId(params.id);
  if (!product || (product.status !== "active" && product.status !== "suspended"))
    notFound();
  productsRepo.update(product.id, { viewCount: product.viewCount + 1 });

  const seller = usersRepo.byId(product.sellerId);
  const reviews = reviewsRepo.byProduct(product.id);
  const session = await getSession();
  const hasPurchased =
    session && ordersRepo.customerHasPurchased(session.uid, product.id) != null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 grid lg:grid-cols-[1fr_360px] gap-10">
      <div>
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-transparent border border-[color:var(--border)] flex items-center justify-center">
          {product.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono text-xs tracking-[0.4em] text-[color:var(--fg-muted)]/50 select-none">
              {TYPE_GLYPH[product.productType]}
            </span>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="outline" className="bg-[color:var(--card)]/80 backdrop-blur">
              {product.productType}
            </Badge>
            {product.isFeatured && (
              <Badge className="bg-black/80 text-white border-none">Featured</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3 text-xs text-[color:var(--fg-muted)] uppercase tracking-widest">
          <span>by {seller?.sellerProfile?.businessName ?? seller?.name}</span>
          <span>·</span>
          <span>{product.purchaseCount} sold</span>
        </div>
        <h1 className="font-serif-display text-5xl leading-[1.05] tracking-tight text-balance mb-4">
          {product.title}
        </h1>
        <div className="flex items-center gap-4 mb-8">
          <RatingStars value={product.averageRating} showNumber />
          <span className="text-sm text-[color:var(--fg-muted)]">
            {product.reviewCount} review{product.reviewCount !== 1 && "s"}
          </span>
          {product.isSoftware && (
            <Badge variant="success" className="ml-2">
              <Key className="w-3 h-3 mr-1 inline" /> License key
            </Badge>
          )}
        </div>
        <div className="prose prose-sm max-w-none text-[color:var(--fg-muted)] leading-relaxed whitespace-pre-line">
          {product.description}
        </div>

        <ReviewSection
          productId={product.id}
          reviews={reviews}
          canReview={!!hasPurchased}
          sellerId={product.sellerId}
          sessionUserId={session?.uid}
        />
      </div>

      <aside className="lg:sticky lg:top-24 self-start space-y-4">
        <Card className="overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[color:var(--fg-muted)] mb-1">Price</p>
              <div className="flex items-baseline gap-2">
                <span className="font-serif-display text-5xl tracking-tight">
                  {formatMoney(product.priceCents)}
                </span>
                <span className="text-xs text-[color:var(--fg-muted)]">USD</span>
              </div>
            </div>
            <AddToCartButton productId={product.id} />
            <ul className="text-xs text-[color:var(--fg-muted)] space-y-1.5 pt-2 border-t border-[color:var(--border)]">
              <li className="flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Instant download after payment</li>
              <li className="flex items-center gap-2"><RefreshCcw className="w-3.5 h-3.5" /> 30-day download window</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Paddle merchant of record</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-[color:var(--fg-muted)] mb-2">Sold by</p>
            <div className="flex items-center gap-3">
              <span className="grid place-items-center h-10 w-10 rounded-full bg-gradient-to-br from-[color:var(--brand-500)] to-[color:var(--brand-700)] text-white text-sm font-semibold">
                {(seller?.sellerProfile?.businessName ?? seller?.name ?? "?").charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-medium leading-tight">{seller?.sellerProfile?.businessName ?? seller?.name}</p>
                <p className="text-xs text-[color:var(--fg-muted)] line-clamp-1">{seller?.sellerProfile?.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
