"use client";

import { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { formatMoney } from "@/src/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { usePaddle, openPaddleCheckout } from "@/src/lib/paddle/usePaddle";

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
  const { ready: paddleReady, error: paddleError } = usePaddle();

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
    if (!paddleReady) {
      toast.error(paddleError ?? "Payment system still loading — try again");
      return;
    }
    setBusy(true);
    try {
      // 1. Server creates a Paddle transaction, returns its id
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.transactionId) {
        toast.error(data.error ?? "Checkout could not start");
        setBusy(false);
        return;
      }
      const transactionId: string = data.transactionId;

      // 2. Open Paddle inline overlay
      openPaddleCheckout({
        transactionId,
        onCompleted: async () => {
          // 3. Server confirms with Paddle and creates the order
          try {
            const confirm = await fetch("/api/checkout/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transactionId }),
            });
            const cj = await confirm.json().catch(() => ({}));
            if (confirm.ok && cj.orderId) {
              toast.success("Payment completed");
              r.push(`/orders/${cj.orderId}?new=1`);
              return;
            }
            toast.message("Payment received", {
              description: "Finalizing your order…",
            });
            r.push(`/checkout/success?_ptxn=${encodeURIComponent(transactionId)}`);
          } catch (e) {
            console.error(e);
            r.push(`/checkout/success?_ptxn=${encodeURIComponent(transactionId)}`);
          }
        },
        onClosed: (data) => {
          if (data?.status !== "completed") setBusy(false);
        },
        onError: () => {
          toast.error("Paddle reported an error — see browser console");
          setBusy(false);
        },
      });
    } catch (e: any) {
      console.error("[checkout] error", e);
      toast.error(e?.message ?? "Checkout failed");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 pt-4 border-t border-[color:var(--border)]">
      <div className="flex gap-2">
        <Input
          value={c}
          onChange={(e) => setC(e.target.value.toUpperCase())}
          placeholder="Discount code"
        />
        <Button variant="outline" onClick={applyCode} disabled={busy}>
          Apply
        </Button>
      </div>
      {errors.map((er, i) => (
        <p key={i} className="text-sm text-[color:var(--destructive)]">
          {er}
        </p>
      ))}
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>{formatMoney(subtotalCents)}</span>
      </div>
      {discountCents > 0 && (
        <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
          <span>Discount</span>
          <span>−{formatMoney(discountCents)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold text-lg">
        <span>Total</span>
        <span>{formatMoney(totalCents)}</span>
      </div>
      <Button
        variant="primary"
        className="w-full"
        size="xl"
        onClick={checkout}
        disabled={busy || !paddleReady}
      >
        {busy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Processing…
          </>
        ) : !paddleReady ? (
          "Loading payment…"
        ) : (
          `Checkout · ${formatMoney(totalCents)}`
        )}
      </Button>
    </div>
  );
}
