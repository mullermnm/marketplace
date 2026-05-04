import * as React from "react";
import { cn } from "@/src/lib/utils";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--card-foreground)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
      className,
    )}
    {...props}
  />
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;

export const CardTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn("text-base font-semibold leading-none tracking-tight", className)}
    {...props}
  />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn("p-6 pt-0", className)} {...props} />;
