import { requireRole } from "@/src/lib/auth/guards";
import { adminAnalytics } from "@/src/lib/services/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { formatMoney } from "@/src/lib/utils";
import Link from "next/link";

export default async function AdminDashboard() {
  await requireRole("admin");
  const a = adminAnalytics();
  return (
    <div className="mx-auto max-w-6xl py-8 px-4 space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/sellers/pending" className="underline">Pending sellers</Link>
          <Link href="/admin/products/pending" className="underline">Product queue</Link>
          <Link href="/admin/orders" className="underline">Orders</Link>
          <Link href="/admin/refunds" className="underline">Refunds</Link>
          <Link href="/admin/fraud" className="underline">Fraud</Link>
          <Link href="/admin/categories" className="underline">Categories</Link>
          <Link href="/admin/sellers" className="underline">Sellers</Link>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat title="GMV (month)" value={formatMoney(a.gmvCents)} />
        <Stat title="Platform revenue" value={formatMoney(a.platformRevenueCents)} />
        <Stat title="Seller revenue" value={formatMoney(a.sellerRevenueCents)} />
        <Stat title="Active sellers" value={String(a.activeSellers)} />
        <Stat title="Customers" value={String(a.activeCustomers)} />
        <Stat title="Active products" value={String(a.activeProducts)} />
      </div>
      <Card>
        <CardHeader><CardTitle>Top sellers</CardTitle></CardHeader>
        <CardContent>
          {a.topSellers.length === 0 && <p className="text-sm text-muted-foreground">No data.</p>}
          <ul className="text-sm space-y-1">
            {a.topSellers.map((s) => (
              <li key={s.id} className="flex justify-between"><span>{s.name}</span><span>{formatMoney(s.revenueCents)}</span></li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Top products</CardTitle></CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1">
            {a.topProducts.map((p) => (
              <li key={p.id} className="flex justify-between"><span>{p.title}</span><span>{p.purchaseCount} sold</span></li>
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
