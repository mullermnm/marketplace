import { requireRole } from "@/src/lib/auth/guards";
import { productsRepo } from "@/src/lib/repos/products";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatMoney } from "@/src/lib/utils";

export default async function SellerProductsPage() {
  const session = await requireRole("seller");
  const products = productsRepo.bySeller(session.uid);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Your products ({products.length})</h1>
        <Link href="/seller/products/new"><Button>Create product</Button></Link>
      </div>
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="border border-border rounded-md p-4 flex justify-between items-center">
            <div>
              <Link href={`/products/${p.id}`} className="font-medium hover:underline">{p.title}</Link>
              <p className="text-xs text-muted-foreground">v{p.currentVersion} · {p.purchaseCount} sold</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={p.status === "active" ? "success" : p.status === "rejected" ? "destructive" : "warn"}>
                {p.status}
              </Badge>
              <span>{formatMoney(p.priceCents)}</span>
              <Link href={`/seller/products/${p.id}/edit`} className="text-sm underline">Edit</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
