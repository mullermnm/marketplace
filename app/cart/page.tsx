import { readCart, resolveCart } from "@/src/lib/services/cart";
import { formatMoney } from "@/src/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { CartActions } from "./CartActions";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export default function CartPage() {
  const cart = readCart();
  const resolved = resolveCart(cart);
  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <h1 className="text-2xl font-semibold mb-4">Your cart</h1>
      {resolved.items.length === 0 ? (
        <p className="text-muted-foreground">Empty. <Link href="/products" className="underline">Browse products</Link>.</p>
      ) : (
        <Card>
          <CardHeader><CardTitle>{resolved.items.length} item{resolved.items.length !== 1 && "s"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <ul className="divide-y divide-border">
              {resolved.items.map((i) => (
                <li key={`${i.type}-${i.id}`} className="py-3 flex items-center justify-between">
                  <div>
                    <Link href={`/products/${i.id}`} className="font-medium hover:underline">{i.title}</Link>
                    <p className="text-xs text-muted-foreground">{i.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatMoney(i.priceCents)}</span>
                    <RemoveBtn type={i.type} id={i.id} />
                  </div>
                </li>
              ))}
            </ul>
            <CartActions
              code={cart.code ?? ""}
              subtotalCents={resolved.subtotalCents}
              discountCents={resolved.discountCents}
              totalCents={resolved.totalCents}
              errors={resolved.errors}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RemoveBtn({ type, id }: { type: "product" | "bundle"; id: string }) {
  return (
    <form action="/api/cart/remove" method="post">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="id" value={id} />
      {/* fall back to client component below in CartActions */}
      <Button type="button" variant="ghost" size="sm" data-remove={`${type}:${id}`}>Remove</Button>
    </form>
  );
}
