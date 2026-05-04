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

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const product = productsRepo.byId(params.id);
  if (!product || (product.status !== "active" && product.status !== "suspended"))
    notFound();
  // bump view count (best-effort)
  productsRepo.update(product.id, { viewCount: product.viewCount + 1 });

  const seller = usersRepo.byId(product.sellerId);
  const reviews = reviewsRepo.byProduct(product.id);
  const session = await getSession();
  const hasPurchased =
    session && ordersRepo.customerHasPurchased(session.uid, product.id) != null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 grid md:grid-cols-[1fr_320px] gap-8">
      <div>
        <div className="aspect-video rounded-xl bg-muted flex items-center justify-center text-6xl mb-6">
          {product.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.thumbnailUrl} alt={product.title} className="rounded-xl w-full h-full object-cover" />
          ) : (
            <span className="text-muted-foreground/40">{product.productType}</span>
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
        <div className="flex items-center gap-3 mb-4">
          <RatingStars value={product.averageRating} showNumber />
          <span className="text-sm text-muted-foreground">
            {product.reviewCount} review{product.reviewCount !== 1 && "s"} · {product.purchaseCount} sold
          </span>
          <Badge variant="outline">{product.productType}</Badge>
          {product.isSoftware && <Badge variant="success">License key included</Badge>}
        </div>
        <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>

        <ReviewSection productId={product.id} reviews={reviews} canReview={!!hasPurchased} sellerId={product.sellerId} sessionUserId={session?.uid} />
      </div>
      <aside className="space-y-4">
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="text-3xl font-bold">{formatMoney(product.priceCents)}</div>
            <AddToCartButton productId={product.id} />
            <p className="text-xs text-muted-foreground">
              Instant download after purchase. 30-day download window.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Sold by</p>
            <p className="font-medium">{seller?.sellerProfile?.businessName ?? seller?.name}</p>
            <p className="text-xs text-muted-foreground">{seller?.sellerProfile?.description}</p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
