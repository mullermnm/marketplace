"use client";
import { useRef, MouseEvent } from "react";
import { cn } from "@/src/lib/utils";

export function Spotlight({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  function move(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }
  return (
    <div ref={ref} onMouseMove={move} className={cn("spotlight", className)} {...props}>
      {children}
    </div>
  );
}
