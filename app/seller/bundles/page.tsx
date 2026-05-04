import { requireRole } from "@/src/lib/auth/guards";
import { bundlesRepo } from "@/src/lib/repos/misc";
import { productsRepo } from "@/src/lib/repos/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { BundleForm } from "./BundleForm";
import { formatMoney } from "@/src/lib/utils";

export default async function BundlesPage() {
  const session = await requireRole("seller");
  const bundles = bundlesRepo.bySeller(session.uid);
  const products = productsRepo.bySeller(session.uid).filter((p) => p.status === "active");
  return (
    <div className="mx-auto max-w-4xl py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">Bundles</h1>
      <Card>
        <CardHeader><CardTitle>Create bundle</CardTitle></CardHeader>
        <CardContent>
          <BundleForm products={products.map((p) => ({ id: p.id, title: p.title, priceCents: p.priceCents }))} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Existing</CardTitle></CardHeader>
        <CardContent>
          {bundles.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            <ul className="space-y-2">
              {bundles.map((b) => (
                <li key={b.id} className="flex justify-between border-b border-border pb-2">
                  <span>{b.title} ({b.products.length} items)</span>
                  <span>{formatMoney(b.bundlePriceCents)} (saves {formatMoney(b.savingsCents)})</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
