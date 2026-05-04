import { ordersRepo } from "../repos/orders";
import { productsRepo } from "../repos/products";
import { usersRepo } from "../repos/users";

function inMonth(iso: string, d = new Date()) {
  const t = new Date(iso);
  return (
    t.getUTCFullYear() === d.getUTCFullYear() &&
    t.getUTCMonth() === d.getUTCMonth()
  );
}

export function sellerAnalytics(sellerId: string) {
  const orders = ordersRepo.bySeller(sellerId);
  const completed = orders.filter((o) => o.paymentStatus === "completed");
  let monthRevenue = 0;
  let allTime = 0;
  let monthSales = 0;
  for (const o of completed) {
    for (const i of o.items) {
      if (i.sellerId !== sellerId || i.refunded) continue;
      allTime += i.sellerPayoutCents;
      if (inMonth(o.createdAt)) {
        monthRevenue += i.sellerPayoutCents;
        monthSales += 1;
      }
    }
  }
  const products = productsRepo.bySeller(sellerId);
  const top = [...products].sort((a, b) => b.purchaseCount - a.purchaseCount).slice(0, 5);
  const totalViews = products.reduce((s, p) => s + p.viewCount, 0);
  const totalPurchases = products.reduce((s, p) => s + p.purchaseCount, 0);
  const conversionRate =
    totalViews > 0 ? (totalPurchases / totalViews) * 100 : 0;
  return {
    monthRevenueCents: monthRevenue,
    allTimeRevenueCents: allTime,
    monthSales,
    conversionRate,
    topProducts: top,
  };
}

export function adminAnalytics() {
  const orders = ordersRepo.all().filter((o) => o.paymentStatus === "completed");
  let gmv = 0;
  let platformRev = 0;
  let sellerRev = 0;
  for (const o of orders) {
    if (!inMonth(o.createdAt)) continue;
    gmv += o.totalCents;
    platformRev += o.totalCommissionCents;
    sellerRev += o.totalSellerPayoutCents;
  }
  const activeSellers = usersRepo
    .all()
    .filter(
      (u) => u.role === "seller" && u.sellerProfile?.status === "approved",
    ).length;
  const activeCustomers = usersRepo.countByRole("customer");
  const activeProducts = productsRepo.count((p) => p.status === "active");

  // top sellers by revenue
  const sellerRevenue = new Map<string, number>();
  for (const o of orders) {
    for (const i of o.items) {
      sellerRevenue.set(
        i.sellerId,
        (sellerRevenue.get(i.sellerId) ?? 0) + i.sellerPayoutCents,
      );
    }
  }
  const topSellers = Array.from(sellerRevenue.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, cents]) => ({ id, name: usersRepo.byId(id)?.name ?? id, revenueCents: cents }));

  const topProducts = [...productsRepo.active()]
    .sort((a, b) => b.purchaseCount - a.purchaseCount)
    .slice(0, 5);

  return {
    gmvCents: gmv,
    platformRevenueCents: platformRev,
    sellerRevenueCents: sellerRev,
    activeSellers,
    activeCustomers,
    activeProducts,
    topSellers,
    topProducts,
  };
}
