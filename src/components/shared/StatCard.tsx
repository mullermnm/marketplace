import { cn } from "@/src/lib/utils";

export function StatCard({
  label,
  value,
  trend,
  hint,
  accent = false,
  className,
}: {
  label: string;
  value: string | number;
  trend?: string;
  hint?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 transition-shadow hover:shadow-[var(--shadow-md)]",
      className,
    )}>
      {accent && (
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[color:var(--brand-500)]/15 blur-2xl pointer-events-none" />
      )}
      <p className="text-xs uppercase tracking-widest text-[color:var(--fg-muted)] mb-2">
        {label}
      </p>
      <p className={cn(
        "font-serif-display text-3xl tracking-tight leading-none",
        accent && "gradient-text",
      )}>
        {value}
      </p>
      {(trend || hint) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className={trend.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
              {trend}
            </span>
          )}
          {hint && <span className="text-[color:var(--fg-muted)]">{hint}</span>}
        </div>
      )}
    </div>
  );
}
