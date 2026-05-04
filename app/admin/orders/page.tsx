import { requireRole } from "@/src/lib/auth/guards";
import { ordersRepo } from "@/src/lib/repos/orders";
import { formatMoney } from "@/src/lib/utils";
import Link from "next/link";

export default async function AdminOrders() {
  await requireRole("admin");
  const orders = ordersRepo.all().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return (
    <div className="mx-auto max-w-5xl py-8 px-4">
      <h1 className="text-2xl font-semibold mb-4">All orders ({orders.length})</h1>
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr><th>ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-border">
              <td><Link href={`/orders/${o.id}`} className="hover:underline">{o.id.slice(0, 12)}</Link></td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
              <td>{o.items.length}</td>
              <td>{formatMoney(o.totalCents)}</td>
              <td>{o.paymentStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
