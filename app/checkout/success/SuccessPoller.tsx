"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export function SuccessPoller({ transactionId }: { transactionId: string }) {
  const r = useRouter();
  const [state, setState] = useState<"polling" | "found" | "timeout">("polling");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!transactionId) {
      setState("timeout");
      return;
    }
    let attempts = 0;
    const tick = async () => {
      attempts++;
      try {
        const res = await fetch(
          `/api/orders/by-transaction?txn=${encodeURIComponent(transactionId)}`,
        );
        if (res.ok) {
          const j = await res.json();
          if (j.orderId) {
            setOrderId(j.orderId);
            setState("found");
            // Auto-redirect with success flag
            r.push(`/orders/${j.orderId}?new=1`);
            return;
          }
        }
      } catch {}
      if (attempts < 30) {
        setTimeout(tick, 2000);
      } else {
        setState("timeout");
      }
    };
    tick();
  }, [transactionId, r]);

  if (state === "polling") {
    return (
      <>
        <Loader2 className="w-12 h-12 mx-auto text-[color:var(--brand-500)] animate-spin mb-6" />
        <h1 className="font-serif-display text-3xl tracking-tight mb-2">
          Finalizing your order…
        </h1>
        <p className="text-sm text-[color:var(--fg-muted)]">
          Paddle confirmed your payment. We're attaching your downloads now —
          this usually takes a couple of seconds.
        </p>
        {transactionId && (
          <p className="mt-6 text-[10px] uppercase tracking-widest text-[color:var(--fg-muted)] font-mono">
            txn {transactionId.slice(0, 16)}
          </p>
        )}
      </>
    );
  }
  if (state === "found") {
    return (
      <>
        <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-6" />
        <h1 className="font-serif-display text-3xl tracking-tight mb-2">
          You're set
        </h1>
        <p className="text-sm text-[color:var(--fg-muted)]">
          Order created. Redirecting…
        </p>
      </>
    );
  }
  return (
    <>
      <XCircle className="w-12 h-12 mx-auto text-amber-500 mb-6" />
      <h1 className="font-serif-display text-3xl tracking-tight mb-2">
        Still processing
      </h1>
      <p className="text-sm text-[color:var(--fg-muted)] mb-6">
        Paddle accepted your payment but we haven't received the webhook yet.
        Refresh your orders page in a minute — it'll appear there.
      </p>
      <div className="flex gap-2 justify-center">
        <Button asChild variant="primary">
          <Link href="/orders">View orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Keep browsing</Link>
        </Button>
      </div>
    </>
  );
}
