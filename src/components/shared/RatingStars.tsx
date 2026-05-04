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
  const rounded = Math.round(value * 2) / 2; // 0.5 increments
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${value.toFixed(1)} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= rounded;
        const half = !filled && n - 0.5 === rounded;
        return (
          <span key={n} className="relative inline-flex">
            <Star className={cn(sz, "text-[color:var(--border-strong)]")} />
            {(filled || half) && (
              <Star
                className={cn(sz, "absolute inset-0 fill-amber-400 text-amber-400")}
                style={half ? { clipPath: "inset(0 50% 0 0)" } : undefined}
              />
            )}
          </span>
        );
      })}
      {showNumber && (
        <span className="text-xs text-[color:var(--fg-muted)] ml-1.5 font-mono">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
