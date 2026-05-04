import { requireRole } from "@/src/lib/auth/guards";
import { ordersRepo } from "@/src/lib/repos/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";

export default async function FraudPage() {
  await requireRole("admin");
  const flagged = ordersRepo.flagged();
  return (
    <div className="mx-auto max-w-3xl py-8 px-4 space-y-4">
      <h1 className="text-2xl font-semibold">Fraud queue ({flagged.length})</h1>
      {flagged.length === 0 && <p className="text-muted-foreground">Nothing flagged.</p>}
      {flagged.map((o) => (
        <Card key={o.id}>
          <CardHeader>
            <CardTitle>Order {o.id.slice(0,12)} — {formatMoney(o.totalCents)}
              <Badge variant="warn" className="ml-2">score {o.fraudScore ?? 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Flags: {o.fraudFlags?.join(", ") || "none"}</p>
            <div className="flex gap-2">
              <form action="/api/admin/fraud/approve" method="post">
                <input type="hidden" name="orderId" value={o.id} />
                <Button type="submit">Approve</Button>
              </form>
              <form action="/api/admin/fraud/reject" method="post">
                <input type="hidden" name="orderId" value={o.id} />
                <Button type="submit" variant="destructive">Reject (refund)</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
