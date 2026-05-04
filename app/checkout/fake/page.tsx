import { redirect } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { formatMoney } from "@/src/lib/utils";

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
    <div className="mx-auto max-w-md py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Paddle (sandbox / fake)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This is a stubbed checkout. Click below to simulate Paddle confirming payment and firing the webhook.
          </p>
          <p className="text-sm">Email: <code>{searchParams.email}</code></p>
          {searchParams.type === "subscription" ? (
            <p>Subscribing to <b>{searchParams.tierId}</b> tier.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {items.map((i: any, k: number) => (
                <li key={k} className="flex justify-between">
                  <span>{i.name}</span><span>{formatMoney(i.priceCents)}</span>
                </li>
              ))}
              <li className="flex justify-between font-semibold pt-2 border-t border-border">
                <span>Total</span><span>{formatMoney(total)}</span>
              </li>
            </ul>
          )}
          <form action="/api/webhooks/paddle/simulate" method="post" className="space-y-2">
            <input type="hidden" name="checkoutId" value={searchParams.checkoutId} />
            <input type="hidden" name="type" value={searchParams.type ?? "products"} />
            <input type="hidden" name="tierId" value={searchParams.tierId ?? ""} />
            <input type="hidden" name="email" value={searchParams.email ?? ""} />
            <input type="hidden" name="meta" value={searchParams.meta ?? "{}"} />
            <input type="hidden" name="items" value={searchParams.items ?? "[]"} />
            <Button type="submit" className="w-full">Simulate successful payment</Button>
          </form>
          <form action="/api/webhooks/paddle/simulate" method="post">
            <input type="hidden" name="checkoutId" value={searchParams.checkoutId} />
            <input type="hidden" name="type" value={searchParams.type ?? "products"} />
            <input type="hidden" name="email" value={searchParams.email ?? ""} />
            <input type="hidden" name="fail" value="1" />
            <Button type="submit" variant="outline" className="w-full">Simulate failure</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
