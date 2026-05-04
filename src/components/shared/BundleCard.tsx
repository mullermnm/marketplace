import Link from "next/link";
import { BundleDoc } from "@/src/lib/repos/misc";
import { formatMoney } from "@/src/lib/utils";
import { Spotlight } from "@/src/components/fx/Spotlight";
import { Badge } from "@/src/components/ui/badge";
import { Package } from "lucide-react";
import { usersRepo } from "@/src/lib/repos/users";

export function BundleCard({ bundle }: { bundle: BundleDoc }) {
  const seller = usersRepo.byId(bundle.sellerId);
  return (
    <Link href={`/bundles/${bundle.id}`} className="block group">
      <Spotlight className="h-full rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] overflow-hidden lift">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-transparent flex items-center justify-center">
          <div className="absolute inset-0 dots opacity-30" aria-hidden />
          <Package className="w-10 h-10 text-[color:var(--fg-muted)]/40" />
          <Badge className="absolute top-3 left-3 bg-black/80 text-white border-none">
            Bundle of {bundle.products.length}
          </Badge>
          {bundle.savingsPercentage >= 10 && (
            <Badge variant="success" className="absolute top-3 right-3">
              Save {Math.round(bundle.savingsPercentage)}%
            </Badge>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-medium leading-tight line-clamp-1 group-hover:text-[color:var(--brand-600)] dark:group-hover:text-[color:var(--brand-300)] transition-colors">
              {bundle.title}
            </h3>
          </div>
          <p className="text-xs text-[color:var(--fg-muted)] mt-1 line-clamp-1">
            by {seller?.sellerProfile?.businessName ?? seller?.name}
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-semibold tracking-tight">{formatMoney(bundle.bundlePriceCents)}</span>
            {bundle.savingsCents > 0 && (
              <span className="text-xs text-[color:var(--fg-muted)] line-through">
                {formatMoney(bundle.individualTotalCents)}
              </span>
            )}
          </div>
        </div>
      </Spotlight>
    </Link>
  );
}
