import * as React from "react";
import { cn } from "@/src/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3.5 py-2 text-sm shadow-sm placeholder:text-[color:var(--fg-muted)]/70 transition-all",
      "focus-visible:outline-none focus-visible:border-[color:var(--brand-500)] focus-visible:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[100px] w-full rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3.5 py-2.5 text-sm shadow-sm placeholder:text-[color:var(--fg-muted)]/70 transition-all",
      "focus-visible:outline-none focus-visible:border-[color:var(--brand-500)] focus-visible:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className,
  ...props
}) => (
  <label
    className={cn(
      "text-xs font-medium tracking-wide uppercase text-[color:var(--fg-muted)] mb-1.5 block",
      className,
    )}
    {...props}
  />
);
