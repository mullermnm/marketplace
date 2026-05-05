import { cn } from "@/src/lib/utils";

export function Section({
  title,
  hint,
  action,
  children,
  className,
}: {
  title?: string;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] overflow-hidden",
        className,
      )}
    >
      {(title || action) && (
        <header className="px-5 py-4 border-b border-[color:var(--border)] flex items-center justify-between gap-3">
          <div>
            {title && <h3 className="font-medium text-[15px]">{title}</h3>}
            {hint && (
              <p className="text-xs text-[color:var(--fg-muted)] mt-0.5">{hint}</p>
            )}
          </div>
          {action && <div className="text-sm">{action}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[color:var(--border)] p-10 text-center">
      <p className="font-medium">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-[color:var(--fg-muted)]">{description}</p>
      )}
      {action && <div className="mt-4 inline-flex">{action}</div>}
    </div>
  );
}
