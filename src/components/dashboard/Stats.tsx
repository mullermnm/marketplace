import { cn } from "@/src/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatTile({
  label,
  value,
  hint,
  trend,
  highlight = false,
  spark,
}: {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  highlight?: boolean;
  spark?: number[];
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-[color:var(--card)] p-5 transition-shadow hover:shadow-[var(--shadow-md)]",
        highlight ? "border-[color:var(--brand-500)]/30" : "border-[color:var(--border)]",
      )}
    >
      {highlight && (
        <>
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[color:var(--brand-500)]/15 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" aria-hidden />
        </>
      )}
      <div className="relative">
        <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[color:var(--fg-muted)]">
          {label}
        </p>
        <p
          className={cn(
            "font-serif-display text-3xl md:text-[2.5rem] tracking-tight leading-none mt-2",
            highlight && "gradient-text",
          )}
        >
          {value}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          {trend ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono tabular-nums",
                trend.positive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {trend.positive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {trend.value}
            </span>
          ) : (
            <span />
          )}
          {hint && (
            <span className="text-[color:var(--fg-muted)]">{hint}</span>
          )}
        </div>
        {spark && spark.length > 1 && (
          <div className="mt-3">
            <Sparkline values={spark} positive={trend?.positive ?? true} />
          </div>
        )}
      </div>
    </div>
  );
}

export function Sparkline({
  values,
  positive = true,
}: {
  values: number[];
  positive?: boolean;
}) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const w = 120;
  const h = 28;
  const stepX = w / (values.length - 1);
  const points = values.map(
    (v, i) => `${i * stepX},${h - (v / max) * (h - 4) - 2}`,
  );
  const stroke = positive
    ? "var(--brand-500)"
    : "rgb(239 68 68)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
