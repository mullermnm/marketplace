"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TIERS, TIER_ORDER, TierId } from "@/src/lib/config/tiers";
import { Button } from "@/src/components/ui/button";
import { formatMoney } from "@/src/lib/utils";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePaddle, openPaddleCheckout } from "@/src/lib/paddle/usePaddle";

const FEATURES: Record<string, string[]> = {
  free_trial: ["5 products", "5 GB storage", "10% platform fee", "Standard analytics"],
  basic: ["50 products", "50 GB storage", "7% platform fee", "Standard analytics", "Discount codes"],
  pro: [
    "500 products",
    "500 GB storage",
    "5% platform fee",
    "Advanced analytics",
    "Customer demographics",
    "Priority email support",
  ],
  enterprise: [
    "Unlimited products",
    "2 TB storage",
    "3% platform fee",
    "Advanced analytics + cohorts",
    "Custom commission rates",
    "Dedicated CSM",
  ],
};

export function SubscriptionTiers({
  currentTier,
  customerEmail,
  autoOpen,
}: {
  currentTier?: TierId;
  customerEmail: string;
  autoOpen?: TierId;
}) {
  const router = useRouter();
  const { ready, error } = usePaddle();
  const [busy, setBusy] = useState<string | null>(null);
  const triggered = useRef(false);

  // Auto-open the Paddle overlay when arriving via /subscription?plan=<tier>
  useEffect(() => {
    if (!autoOpen || triggered.current) return;
    if (autoOpen === currentTier) return; // already on this plan
    if (autoOpen !== "free_trial" && !ready) return; // wait for Paddle.js
    triggered.current = true;
    handleClick(autoOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen, ready]);

  async function handleClick(tierId: TierId) {
    if (tierId === currentTier) return;
    setBusy(tierId);

    try {
      // Free tier — server-side activation, no Paddle needed.
      if (tierId === "free_trial") {
        const r = await fetch("/api/seller/subscription/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tierId }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error ?? "Failed");
        toast.success("Switched to Free Trial");
        router.refresh();
        return;
      }

      if (!ready) {
        toast.error(error ?? "Payment system still loading — try again");
        return;
      }

      // 1. Ask server to create a Paddle transaction, get back a txn id
      const r = await fetch("/api/seller/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.transactionId) {
        throw new Error(j.error ?? "Could not start checkout");
      }

      // 2. Open Paddle.js inline overlay
      openPaddleCheckout({
        transactionId: j.transactionId,
        customerEmail,
        onCompleted: async () => {
          // 3. Tell our server to confirm + activate the tier from the txn id.
          //    This works without webhooks (good for local dev).
          //    In prod the webhook is a redundant safety net.
          try {
            const confirm = await fetch("/api/seller/subscription/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transactionId: j.transactionId }),
            });
            if (confirm.ok) {
              toast.success("Subscription updated");
            } else {
              const ej = await confirm.json().catch(() => ({}));
              toast.message(
                "Payment received. Tier will activate momentarily.",
                { description: ej.error ?? "Webhook will finalize." },
              );
            }
          } finally {
            router.push("/seller/subscription?ok=1");
            router.refresh();
          }
        },
        onClosed: (data) => {
          if (data?.status !== "completed") {
            // user cancelled — just clear the spinner
            setBusy(null);
          }
        },
        onError: () => {
          toast.error("Checkout error in Paddle.js — see browser console");
          setBusy(null);
        },
      });
    } catch (e: any) {
      console.error("[subscription] click error", e);
      toast.error(e?.message ?? "Failed");
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-4">
      {TIER_ORDER.map((id, i) => {
        const t = TIERS[id];
        const isCurrent = currentTier === id;
        const isLoading = busy === id;
        const popular = i === 2;
        return (
          <div
            key={id}
            className={`relative rounded-2xl p-6 transition-all ${
              popular
                ? "gradient-border bg-[color:var(--card)] -translate-y-2 lg:scale-[1.02]"
                : "border border-[color:var(--border)] bg-[color:var(--card)] hover:border-[color:var(--border-strong)]"
            }`}
          >
            {popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--brand-600)] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">
                Most popular
              </span>
            )}
            <h3 className="font-serif-display text-2xl tracking-tight">{t.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight">
                {formatMoney(t.monthlyPriceCents)}
              </span>
              <span className="text-sm text-[color:var(--fg-muted)]">/mo</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm">
              {FEATURES[id].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] shrink-0" />
                  <span className="text-[color:var(--fg-muted)]">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleClick(id)}
              variant={popular ? "primary" : "outline"}
              className="w-full mt-6"
              disabled={isCurrent || isLoading || (id !== "free_trial" && !ready)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing…
                </>
              ) : isCurrent ? (
                "Current plan"
              ) : id === "free_trial" ? (
                "Switch to free"
              ) : !ready ? (
                "Loading…"
              ) : (
                "Choose"
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
