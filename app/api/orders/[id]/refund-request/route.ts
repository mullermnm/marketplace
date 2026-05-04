import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { ordersRepo } from "@/src/lib/repos/orders";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const o = ordersRepo.byId(params.id);
  if (!o || o.customerId !== session.uid)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const reason = String(body.reason ?? "").slice(0, 500);
  if (reason.length < 4)
    return NextResponse.json({ error: "Tell us why you'd like a refund" }, { status: 400 });
  ordersRepo.update(o.id, {
    requiresReview: true,
    refundReason: reason,
  });
  return NextResponse.json({ ok: true });
}
