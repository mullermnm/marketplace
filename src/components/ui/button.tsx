import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--fg)] text-[color:var(--bg)] hover:bg-[color:var(--fg)]/90 shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_1px_2px_rgba(0,0,0,0.18)]",
        primary:
          "text-white shimmer-bg shadow-[0_8px_24px_-8px_rgba(124,58,237,0.6)] hover:shadow-[0_12px_32px_-8px_rgba(124,58,237,0.8)]",
        outline:
          "border border-[color:var(--border)] bg-[color:var(--card)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--muted)]",
        ghost: "hover:bg-[color:var(--muted)]",
        destructive:
          "bg-[color:var(--destructive)] text-white hover:opacity-90 shadow-md",
        link: "underline-offset-4 hover:underline text-[color:var(--brand-600)]",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-[0.95rem]",
        xl: "h-12 px-7 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref as any}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
