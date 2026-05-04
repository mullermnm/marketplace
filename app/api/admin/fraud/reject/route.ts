import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { refundFullOrder } from "@/src/lib/services/refunds";
import { ordersRepo } from "@/src/lib/repos/orders";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fd = await req.formData();
  const orderId = String(fd.get("orderId"));
  await refundFullOrder(orderId, "Fraud rejection", session.uid);
  ordersRepo.update(orderId, { requiresReview: false });
  return NextResponse.redirect(new URL("/admin/fraud", req.url));
}
