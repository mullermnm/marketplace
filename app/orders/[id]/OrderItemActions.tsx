"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

function CopyButton({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className="inline-flex items-center gap-1 text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] transition-colors"
      aria-label="Copy"
    >
      {done ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

export const OrderItemActions = { Copy: CopyButton };
