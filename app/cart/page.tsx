import { readCart, resolveCart } from "@/src/lib/services/cart";
import { formatMoney } from "@/src/lib/utils";
import { Card, CardContent } from "@/src/components/ui/card";
import { CartActions } from "./CartActions";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default function CartPage() {
  const cart = readCart();
  const resolved = resolveCart(cart);
  return (
    <div className="mx-auto max-w-3xl py-12 px-6">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] mb-1">
          Cart
        </p>
        <h1 className="font-serif-display text-4xl tracking-tight">Review your cart</h1>
      </div>
      {resolved.items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <span className="inline-grid place-items-center h-14 w-14 rounded-full bg-[color:var(--muted)] text-[color:var(--fg-muted)] mb-4">
              <ShoppingBag className="w-6 h-6" />
            </span>
            <h2 className="font-serif-display text-2xl mb-2">Your cart is empty</h2>
            <p className="text-sm text-[color:var(--fg-muted)] mb-6">
              Discover digital products from creators worldwide.
            </p>
            <Link href="/products"><Button variant="primary">Browse the marketplace</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-[color:var(--border)]">
              {resolved.items.map((i) => (
                <li key={`${i.type}-${i.id}`} className="px-6 py-5 flex items-center gap-4">
                  <span className="grid place-items-center h-12 w-12 rounded-md bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 font-mono text-[10px] uppercase tracking-widest text-[color:var(--fg-muted)]">
                    {i.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${i.id}`} className="font-medium hover:underline line-clamp-1">
                      {i.title}
                    </Link>
                    <p className="text-xs text-[color:var(--fg-muted)]">{i.type === "bundle" ? `Bundle of ${i.contains?.length ?? 0}` : "Digital product"}</p>
                  </div>
                  <span className="font-semibold tracking-tight whitespace-nowrap">
                    {formatMoney(i.priceCents)}
                  </span>
                  <button
                    type="button"
                    data-remove={`${i.type}:${i.id}`}
                    className="text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--destructive)] transition-colors"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="px-6 py-5 bg-[color:var(--muted)]/40">
              <CartActions
                code={cart.code ?? ""}
                subtotalCents={resolved.subtotalCents}
                discountCents={resolved.discountCents}
                totalCents={resolved.totalCents}
                errors={resolved.errors}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
