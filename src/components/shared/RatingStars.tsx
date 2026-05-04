import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function RatingStars({
  value,
  size = "md",
  showNumber = false,
}: {
  value: number;
  size?: "sm" | "md";
  showNumber?: boolean;
}) {
  const sz = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(sz, n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
        />
      ))}
      {showNumber && <span className="text-xs text-muted-foreground ml-1">{value.toFixed(1)}</span>}
    </div>
  );
}
