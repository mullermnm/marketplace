import Link from "next/link";
import { cn } from "@/src/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export function DashboardShell({
  title,
  eyebrow,
  description,
  nav,
  active,
  actions,
  children,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  nav: NavItem[];
  active: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Hero strip */}
      <section className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] mb-8 bg-[color:var(--card)]">
        <div className="absolute inset-0 gradient-mesh" aria-hidden />
        <div className="absolute inset-0 dots opacity-30" aria-hidden />
        <div className="relative px-8 py-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] mb-2 font-medium">
              {eyebrow}
            </p>
            <h1 className="font-serif-display text-4xl md:text-5xl tracking-tight text-balance leading-[1.05]">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-xl text-sm text-[color:var(--fg-muted)]">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>
      </section>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        {/* Side rail */}
        <aside className="lg:sticky lg:top-24 self-start">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-1 px-1 pb-2 lg:pb-0">
            {nav.map((n) => {
              const isActive = n.href === active;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "group inline-flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-[color:var(--fg)] text-[color:var(--bg)] font-medium shadow-[var(--shadow-sm)]"
                      : "text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--muted)]",
                  )}
                >
                  {n.icon && (
                    <span className={cn("opacity-80", isActive && "opacity-100")}>
                      {n.icon}
                    </span>
                  )}
                  <span className="flex-1">{n.label}</span>
                  {n.badge != null && (
                    <span
                      className={cn(
                        "text-[10px] tabular-nums font-mono px-1.5 py-0.5 rounded-full",
                        isActive
                          ? "bg-[color:var(--bg)]/20 text-[color:var(--bg)]"
                          : "bg-[color:var(--muted)] text-[color:var(--fg-muted)]",
                      )}
                    >
                      {n.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <section className="min-w-0 space-y-6">{children}</section>
      </div>
    </div>
  );
}
