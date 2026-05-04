import { redirect } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { formatMoney } from "@/src/lib/utils";
import { ShieldCheck, Lock, CreditCard } from "lucide-react";

interface SP {
  checkoutId?: string;
  type?: "products" | "subscription";
  meta?: string;
  items?: string;
  email?: string;
  tierId?: string;
}

export default function FakeCheckout({ searchParams }: { searchParams: SP }) {
  if (!searchParams.checkoutId) redirect("/cart");
  const items = searchParams.items ? JSON.parse(searchParams.items) : [];
  const total = items.reduce((s: number, i: any) => s + i.priceCents * (i.quantity ?? 1), 0);
  return (
    <div className="mx-auto max-w-2xl py-12 px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-1 text-xs mb-4">
          <Lock className="w-3 h-3" /> Sandbox checkout · stub Paddle
        </div>
        <h1 className="font-serif-display text-4xl tracking-tight">Confirm your order</h1>
        <p className="text-[color:var(--fg-muted)] text-sm mt-2">
          In production this is replaced by Paddle's hosted checkout.
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-[color:var(--border)] flex items-center justify-between">
            <p className="text-sm text-[color:var(--fg-muted)]">Billed to</p>
            <p className="text-sm font-medium font-mono">{searchParams.email}</p>
          </div>
          {searchParams.type === "subscription" ? (
            <div className="px-6 py-5">
              <p className="text-xs uppercase tracking-widest text-[color:var(--fg-muted)] mb-1">Plan</p>
              <p className="font-serif-display text-3xl capitalize">{searchParams.tierId}</p>
            </div>
          ) : (
            <ul className="divide-y divide-[color:var(--border)]">
              {items.map((i: any, k: number) => (
                <li key={k} className="px-6 py-4 flex justify-between items-center text-sm">
                  <span>{i.name}</span>
                  <span className="font-semibold tabular-nums">{formatMoney(i.priceCents)}</span>
                </li>
              ))}
              <li className="px-6 py-4 flex justify-between items-center font-semibold text-lg bg-[color:var(--muted)]/40">
                <span>Total</span>
                <span className="font-serif-display tabular-nums">{formatMoney(total)}</span>
              </li>
            </ul>
          )}
          <div className="px-6 py-5 space-y-3 border-t border-[color:var(--border)]">
            <form action="/api/webhooks/paddle/simulate" method="post" className="space-y-2">
              <input type="hidden" name="checkoutId" value={searchParams.checkoutId} />
              <input type="hidden" name="type" value={searchParams.type ?? "products"} />
              <input type="hidden" name="tierId" value={searchParams.tierId ?? ""} />
              <input type="hidden" name="email" value={searchParams.email ?? ""} />
              <input type="hidden" name="meta" value={searchParams.meta ?? "{}"} />
              <input type="hidden" name="items" value={searchParams.items ?? "[]"} />
              <Button type="submit" size="xl" variant="primary" className="w-full">
                <CreditCard className="w-4 h-4" /> Pay {formatMoney(total)}
              </Button>
            </form>
            <form action="/api/webhooks/paddle/simulate" method="post">
              <input type="hidden" name="checkoutId" value={searchParams.checkoutId} />
              <input type="hidden" name="type" value={searchParams.type ?? "products"} />
              <input type="hidden" name="email" value={searchParams.email ?? ""} />
              <input type="hidden" name="fail" value="1" />
              <Button type="submit" variant="ghost" className="w-full">
                Simulate failure
              </Button>
            </form>
          </div>
          <div className="px-6 py-3 border-t border-[color:var(--border)] flex items-center justify-center gap-4 text-xs text-[color:var(--fg-muted)]">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Encrypted</span>
            <span>·</span>
            <span>Paddle merchant of record</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
