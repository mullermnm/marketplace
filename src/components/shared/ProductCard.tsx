import Link from "next/link";
import { ProductDoc } from "@/src/lib/repos/products";
import { formatMoney } from "@/src/lib/utils";
import { Spotlight } from "@/src/components/fx/Spotlight";
import { RatingStars } from "./RatingStars";
import { usersRepo } from "@/src/lib/repos/users";
import { Badge } from "@/src/components/ui/badge";

const TYPE_GLYPH: Record<ProductDoc["productType"], string> = {
  pdf: "PDF",
  video: "MP4",
  audio: "WAV",
  software: "EXE",
  image: "PNG",
  "3d_model": "GLB",
  document: "DOC",
  other: "BIN",
};

const GRADIENTS = [
  "from-violet-500/20 via-fuchsia-500/10 to-transparent",
  "from-indigo-500/20 via-cyan-400/10 to-transparent",
  "from-rose-500/20 via-orange-400/10 to-transparent",
  "from-emerald-500/20 via-teal-400/10 to-transparent",
  "from-amber-500/20 via-pink-400/10 to-transparent",
];

function gradientFor(id: string) {
  const n = id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return GRADIENTS[n % GRADIENTS.length];
}

export function ProductCard({ product }: { product: ProductDoc }) {
  const seller = usersRepo.byId(product.sellerId);
  const grad = gradientFor(product.id);
  return (
    <Link href={`/products/${product.id}`} className="block group">
      <Spotlight className="h-full rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] overflow-hidden lift">
        <div className={`relative aspect-[4/3] bg-gradient-to-br ${grad} flex items-center justify-center overflow-hidden`}>
          {product.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="font-mono text-xs tracking-widest text-[color:var(--fg-muted)] opacity-70">
              {TYPE_GLYPH[product.productType]}
            </span>
          )}
          {product.isTrending && (
            <Badge variant="success" className="absolute top-3 left-3">Trending</Badge>
          )}
          {product.isFeatured && (
            <Badge className="absolute top-3 right-3 bg-black/80 text-white border-none">Featured</Badge>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent" />
        </div>
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-medium leading-tight line-clamp-1 group-hover:text-[color:var(--brand-600)] dark:group-hover:text-[color:var(--brand-300)] transition-colors">
              {product.title}
            </h3>
            <span className="font-semibold tracking-tight whitespace-nowrap">
              {formatMoney(product.priceCents)}
            </span>
          </div>
          <p className="text-xs text-[color:var(--fg-muted)] mt-1 line-clamp-1">
            by {seller?.sellerProfile?.businessName ?? seller?.name ?? "Anonymous"}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <RatingStars value={product.averageRating} size="sm" />
            <span className="text-xs text-[color:var(--fg-muted)] font-mono">
              {product.purchaseCount} sold
            </span>
          </div>
        </div>
      </Spotlight>
    </Link>
  );
}
