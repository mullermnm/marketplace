import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { ordersRepo } from "@/src/lib/repos/orders";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fd = await req.formData();
  const orderId = String(fd.get("orderId"));
  ordersRepo.update(orderId, {
    paymentStatus: "completed",
    requiresReview: false,
    reviewedBy: session.uid,
    reviewedAt: new Date().toISOString(),
  });
  return NextResponse.redirect(new URL("/admin/fraud", req.url));
}
