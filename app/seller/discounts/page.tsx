import { requireRole } from "@/src/lib/auth/guards";
import { discountsRepo } from "@/src/lib/repos/misc";
import { DiscountForm } from "./DiscountForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { formatMoney } from "@/src/lib/utils";
import { productsRepo } from "@/src/lib/repos/products";

export default async function DiscountsPage() {
  const session = await requireRole("seller");
  const codes = discountsRepo.bySeller(session.uid);
  const products = productsRepo.bySeller(session.uid);
  return (
    <div className="mx-auto max-w-4xl py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">Discount codes</h1>
      <Card>
        <CardHeader><CardTitle>Create new code</CardTitle></CardHeader>
        <CardContent><DiscountForm products={products.map((p) => ({ id: p.id, title: p.title }))} /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Existing</CardTitle></CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            <ul className="text-sm space-y-2">
              {codes.map((c) => (
                <li key={c.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                  <div>
                    <code className="bg-muted px-1.5 py-0.5 rounded">{c.code}</code> — {c.discountType === "percentage" ? `${c.discountValue}%` : formatMoney(c.discountValue)}
                  </div>
                  <span className="text-muted-foreground">
                    {c.currentUses} use{c.currentUses !== 1 && "s"} · revenue {formatMoney(c.totalRevenueCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
