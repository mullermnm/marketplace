import { requireUser } from "@/src/lib/auth/guards";
import { ordersRepo } from "@/src/lib/repos/orders";
import Link from "next/link";
import { formatMoney } from "@/src/lib/utils";

export default async function OrdersPage() {
  const session = await requireUser();
  const orders = ordersRepo.byCustomer(session.uid).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <h1 className="text-2xl font-semibold mb-4">Your orders</h1>
      {orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="border border-border rounded-md p-4">
            <div className="flex justify-between mb-2">
              <Link href={`/orders/${o.id}`} className="font-medium hover:underline">
                Order {o.id.slice(0, 12)}
              </Link>
              <span className="text-sm text-muted-foreground">
                {new Date(o.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm">
              {o.items.length} item{o.items.length !== 1 && "s"} · {formatMoney(o.totalCents)} · {o.paymentStatus}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
