import { requireRole } from "@/src/lib/auth/guards";
import { sellerAnalytics } from "@/src/lib/services/analytics";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { formatMoney } from "@/src/lib/utils";
import Link from "next/link";

export default async function SellerDashboard() {
  const session = await requireRole("seller");
  const a = sellerAnalytics(session.uid);
  const sub = subsRepo.byUserId(session.uid);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Seller dashboard</h1>
        <div className="flex gap-2 text-sm">
          <Link href="/seller/products" className="underline">Products</Link>
          <Link href="/seller/products/new" className="underline">New</Link>
          <Link href="/seller/discounts" className="underline">Discounts</Link>
          <Link href="/seller/bundles" className="underline">Bundles</Link>
          <Link href="/seller/payouts" className="underline">Payouts</Link>
          <Link href="/seller/subscription" className="underline">Subscription</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat title="This month revenue" value={formatMoney(a.monthRevenueCents)} />
        <Stat title="All time revenue" value={formatMoney(a.allTimeRevenueCents)} />
        <Stat title="Sales (month)" value={a.monthSales.toString()} />
        <Stat title="Conversion" value={`${a.conversionRate.toFixed(1)}%`} />
      </div>

      <Card>
        <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>Tier: <b>{sub?.tier}</b></p>
          <p>Commission rate: {sub?.commissionRate}%</p>
          <p>Products: {sub?.currentProductCount} / {sub?.productLimit === -1 ? "∞" : sub?.productLimit}</p>
          <p>Storage: {((sub?.currentStorageBytes ?? 0) / 1024 / 1024).toFixed(2)} MB / {sub?.storageLimitGB} GB</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Top products</CardTitle></CardHeader>
        <CardContent>
          {a.topProducts.length === 0 && <p className="text-muted-foreground text-sm">No products yet.</p>}
          <ul className="space-y-1 text-sm">
            {a.topProducts.map((p) => (
              <li key={p.id} className="flex justify-between">
                <Link href={`/products/${p.id}`} className="hover:underline">{p.title}</Link>
                <span>{p.purchaseCount} sold</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
