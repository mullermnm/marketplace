import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { ordersRepo } from "@/src/lib/repos/orders";

function csvEscape(v: any): string {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "seller")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const orders = ordersRepo.bySeller(session.uid).filter((o) => o.paymentStatus === "completed");
  const header = [
    "order_id",
    "date",
    "product_id",
    "title",
    "price_cents",
    "commission_rate",
    "commission_cents",
    "seller_payout_cents",
    "license_key",
    "refunded",
  ];
  const rows = [header.join(",")];
  for (const o of orders) {
    for (const i of o.items) {
      if (i.sellerId !== session.uid) continue;
      rows.push([
        o.id,
        o.createdAt,
        i.productId,
        i.title,
        i.priceCents,
        i.commissionRate,
        i.commissionCents,
        i.sellerPayoutCents,
        i.licenseKey ?? "",
        i.refunded ? "yes" : "no",
      ].map(csvEscape).join(","));
    }
  }
  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="plinth-sales-${Date.now()}.csv"`,
    },
  });
}
