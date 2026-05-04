import { requireRole } from "@/src/lib/auth/guards";
import { productsRepo } from "@/src/lib/repos/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { formatMoney } from "@/src/lib/utils";

export default async function PendingProducts() {
  await requireRole("admin");
  const list = productsRepo.byStatus("pending_review");
  return (
    <div className="mx-auto max-w-3xl py-8 px-4 space-y-4">
      <h1 className="text-2xl font-semibold">Product approval queue ({list.length})</h1>
      {list.length === 0 && <p className="text-muted-foreground">Nothing pending.</p>}
      {list.map((p) => (
        <Card key={p.id}>
          <CardHeader>
            <CardTitle>{p.title} — {formatMoney(p.priceCents)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{p.description}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Type: {p.productType} · Files: {p.files.length}
            </p>
            <div className="flex gap-2 mt-3">
              <form action="/api/admin/products/approve" method="post">
                <input type="hidden" name="productId" value={p.id} />
                <Button type="submit">Approve</Button>
              </form>
              <form action="/api/admin/products/reject" method="post" className="flex gap-2">
                <input type="hidden" name="productId" value={p.id} />
                <input name="reason" placeholder="Reason" className="h-9 rounded-md border border-border bg-background px-3 text-sm" required />
                <Button type="submit" variant="destructive">Reject</Button>
              </form>
              <form action="/api/admin/products/feature" method="post">
                <input type="hidden" name="productId" value={p.id} />
                <Button type="submit" variant="outline">Approve & feature</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
