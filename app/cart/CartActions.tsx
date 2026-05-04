"use client";

import { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { formatMoney } from "@/src/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CartActions({
  code,
  subtotalCents,
  discountCents,
  totalCents,
  errors,
}: {
  code: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  errors: string[];
}) {
  const r = useRouter();
  const [c, setC] = useState(code);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const btn = target.closest<HTMLElement>("[data-remove]");
      if (!btn) return;
      e.preventDefault();
      const [type, id] = btn.getAttribute("data-remove")!.split(":");
      fetch("/api/cart/remove", {
        method: "POST",
        body: JSON.stringify({ type, id }),
        headers: { "Content-Type": "application/json" },
      }).then(() => r.refresh());
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [r]);

  async function applyCode() {
    setBusy(true);
    const res = await fetch("/api/cart/code", {
      method: "POST",
      body: JSON.stringify({ code: c }),
      headers: { "Content-Type": "application/json" },
    });
    setBusy(false);
    const j = await res.json();
    if (j.errors?.length) toast.error(j.errors.join(", "));
    else toast.success("Code applied");
    r.refresh();
  }

  async function checkout() {
    setBusy(true);
    const res = await fetch("/api/checkout", { method: "POST" });
    setBusy(false);
    const j = await res.json();
    if (!res.ok) {
      toast.error(j.error ?? "Checkout failed");
      return;
    }
    window.location.href = j.checkoutUrl;
  }

  return (
    <div className="space-y-3 pt-4 border-t border-border">
      <div className="flex gap-2">
        <Input value={c} onChange={(e) => setC(e.target.value.toUpperCase())} placeholder="Discount code" />
        <Button variant="outline" onClick={applyCode} disabled={busy}>Apply</Button>
      </div>
      {errors.map((er, i) => (
        <p key={i} className="text-sm text-destructive">{er}</p>
      ))}
      <div className="flex justify-between text-sm">
        <span>Subtotal</span><span>{formatMoney(subtotalCents)}</span>
      </div>
      {discountCents > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Discount</span><span>−{formatMoney(discountCents)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold text-lg">
        <span>Total</span><span>{formatMoney(totalCents)}</span>
      </div>
      <Button className="w-full" size="lg" onClick={checkout} disabled={busy}>
        Checkout
      </Button>
    </div>
  );
}
