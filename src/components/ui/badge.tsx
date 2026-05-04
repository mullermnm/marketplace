import * as React from "react";
import { cn } from "@/src/lib/utils";

export const Badge: React.FC<
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "default" | "outline" | "success" | "warn" | "destructive";
  }
> = ({ className, variant = "default", ...props }) => {
  const styles =
    variant === "outline"
      ? "border border-border"
      : variant === "success"
      ? "bg-green-500/15 text-green-600 dark:text-green-400"
      : variant === "warn"
      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
      : variant === "destructive"
      ? "bg-red-500/15 text-red-600 dark:text-red-400"
      : "bg-muted";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        styles,
        className,
      )}
      {...props}
    />
  );
};
