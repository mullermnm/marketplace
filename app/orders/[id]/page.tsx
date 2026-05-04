import { notFound } from "next/navigation";
import { requireUser } from "@/src/lib/auth/guards";
import { ordersRepo } from "@/src/lib/repos/orders";
import { productsRepo } from "@/src/lib/repos/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { formatMoney } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";
import Link from "next/link";

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const session = await requireUser();
  const order = ordersRepo.byId(params.id);
  if (!order || (order.customerId !== session.uid && session.role !== "admin"))
    notFound();
  return (
    <div className="mx-auto max-w-3xl py-8 px-4 space-y-4">
      <h1 className="text-2xl font-semibold">Order {order.id.slice(0, 12)}</h1>
      <Badge variant={order.paymentStatus === "completed" ? "success" : "warn"}>
        {order.paymentStatus}
      </Badge>
      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((i) => {
            const product = productsRepo.byId(i.productId);
            const expired = Date.now() > new Date(i.downloadTokenExpiry).getTime();
            return (
              <div key={i.productId} className="border-b border-border pb-3 last:border-0">
                <div className="flex justify-between">
                  <Link href={`/products/${i.productId}`} className="font-medium hover:underline">
                    {i.title}
                  </Link>
                  <span>{formatMoney(i.priceCents)}</span>
                </div>
                {i.licenseKey && (
                  <p className="text-sm">
                    License: <code className="bg-muted px-1.5 py-0.5 rounded">{i.licenseKey}</code>
                  </p>
                )}
                <div className="text-sm text-muted-foreground">
                  Expires {new Date(i.downloadTokenExpiry).toLocaleDateString()} ·
                  {" "}downloads: {i.downloadCount}
                </div>
                {i.refunded ? (
                  <Badge variant="destructive">Refunded</Badge>
                ) : expired ? (
                  <span className="text-sm text-destructive">Download window expired</span>
                ) : (
                  <a
                    className="text-sm text-primary underline"
                    href={`/api/download/${i.downloadToken}`}
                  >
                    Download
                  </a>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
      <div className="flex justify-between text-sm">
        <span>Subtotal</span><span>{formatMoney(order.subtotalCents)}</span>
      </div>
      {order.discountCents > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Discount</span><span>−{formatMoney(order.discountCents)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold">
        <span>Total</span><span>{formatMoney(order.totalCents)}</span>
      </div>
    </div>
  );
}
