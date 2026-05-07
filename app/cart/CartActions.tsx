"use client";

import { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { formatMoney } from "@/src/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Paddle.js types
declare global {
  interface Window {
    Paddle: any;
  }
}

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
  const [paddleLoaded, setPaddleLoaded] = useState(false);

  // Load Paddle.js
  useEffect(() => {
    const loadPaddle = async () => {
      if (window.Paddle) {
        setPaddleLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;
      
      script.onload = () => {
        window.Paddle.Initialize({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
          environment: 'sandbox', // Explicitly set sandbox environment
        });
        setPaddleLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load Paddle.js');
        toast.error('Payment system unavailable');
      };

      document.head.appendChild(script);
    };

    loadPaddle();
  }, []);

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
    if (!paddleLoaded) {
      toast.error('Payment system is loading, please try again');
      return;
    }

    setBusy(true);
    
    try {
      // Get transaction data from API
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error ?? "Checkout failed");
        return;
      }

      // Open Paddle inline checkout
      await new Promise<void>((resolve, reject) => {
        window.Paddle.Checkout.open({
          transactionId: data.transactionId,
          settings: {
            displayMode: 'overlay',
            theme: 'light',
            allowLogout: false,
            showAddTaxId: true,
            showAddDiscounts: true,
          },
          eventCallback: (eventData: any) => {
            console.log('Paddle checkout event:', eventData);
            
            switch (eventData.name) {
              case 'checkout.completed':
                toast.success('Payment completed successfully!');
                // Clear cart and redirect to success page
                fetch('/api/cart/clear', { method: 'POST' }).then(() => {
                  r.push('/checkout/success');
                });
                resolve();
                break;
              case 'checkout.closed':
                if (eventData.data?.status === 'completed') {
                  resolve();
                } else {
                  reject(new Error('Checkout cancelled'));
                }
                break;
              case 'checkout.error':
                reject(new Error('Checkout error'));
                break;
            }
          },
        });
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Checkout failed');
    } finally {
      setBusy(false);
    }
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
      <Button 
        className="w-full" 
        size="lg" 
        onClick={checkout} 
        disabled={busy || !paddleLoaded}
      >
        {busy ? 'Processing...' : !paddleLoaded ? 'Loading...' : 'Checkout'}
      </Button>
    </div>
  );
}
