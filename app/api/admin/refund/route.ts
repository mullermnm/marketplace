import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { refundOrderItem } from "@/src/lib/services/refunds";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fd = await req.formData();
  try {
    await refundOrderItem(
      String(fd.get("orderId")),
      String(fd.get("productId")),
      String(fd.get("reason")),
      session.uid,
    );
    return NextResponse.redirect(new URL("/admin/refunds", req.url));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
