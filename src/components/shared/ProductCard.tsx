import Link from "next/link";
import { ProductDoc } from "@/src/lib/repos/products";
import { formatMoney } from "@/src/lib/utils";
import { Card, CardContent } from "@/src/components/ui/card";
import { RatingStars } from "./RatingStars";
import { usersRepo } from "@/src/lib/repos/users";

export function ProductCard({ product }: { product: ProductDoc }) {
  const seller = usersRepo.byId(product.sellerId);
  return (
    <Link href={`/products/${product.id}`} className="block group">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="aspect-[4/3] bg-muted flex items-center justify-center text-4xl">
          {product.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground/50 select-none">
              {emojiFor(product.productType)}
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">{product.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            by {seller?.sellerProfile?.businessName ?? seller?.name ?? "Unknown"}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-semibold">{formatMoney(product.priceCents)}</span>
            <RatingStars value={product.averageRating} size="sm" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function emojiFor(t: ProductDoc["productType"]) {
  switch (t) {
    case "pdf": return "📄";
    case "video": return "🎬";
    case "audio": return "🎧";
    case "software": return "💾";
    case "image": return "🖼️";
    case "3d_model": return "🧊";
    case "document": return "📝";
    default: return "📦";
  }
}
