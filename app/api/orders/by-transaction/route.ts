import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { ordersRepo } from "@/src/lib/repos/orders";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const txn = req.nextUrl.searchParams.get("txn");
  if (!txn) return NextResponse.json({ error: "Missing txn" }, { status: 400 });
  const order = ordersRepo
    .all()
    .find((o) => o.paddleTransactionId === txn && o.customerId === session.uid);
  if (!order) return NextResponse.json({ orderId: null }, { status: 200 });
  return NextResponse.json({ orderId: order.id });
}
