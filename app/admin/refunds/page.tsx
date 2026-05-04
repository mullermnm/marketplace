import { requireRole } from "@/src/lib/auth/guards";
import { ordersRepo } from "@/src/lib/repos/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { formatMoney } from "@/src/lib/utils";

export default async function AdminRefunds() {
  await requireRole("admin");
  const orders = ordersRepo.all().filter(
    (o) => o.paymentStatus === "completed" || o.paymentStatus === "partially_refunded",
  );
  return (
    <div className="mx-auto max-w-3xl py-8 px-4 space-y-4">
      <h1 className="text-2xl font-semibold">Refund management</h1>
      {orders.length === 0 && <p className="text-muted-foreground">No orders.</p>}
      {orders.map((o) => (
        <Card key={o.id}>
          <CardHeader>
            <CardTitle>Order {o.id.slice(0, 12)} — {formatMoney(o.totalCents)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {o.items.map((i) => (
              <div key={i.productId} className="flex justify-between border-b border-border pb-2">
                <span>{i.title} {i.refunded && "(refunded)"}</span>
                {!i.refunded && (
                  <form action="/api/admin/refund" method="post" className="flex gap-1">
                    <input type="hidden" name="orderId" value={o.id} />
                    <input type="hidden" name="productId" value={i.productId} />
                    <input name="reason" placeholder="reason" className="h-8 rounded border border-border bg-background px-2 text-sm" required />
                    <Button size="sm" variant="destructive" type="submit">Refund</Button>
                  </form>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
