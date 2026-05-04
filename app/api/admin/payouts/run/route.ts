import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { runSellerPayouts, runAffiliatePayouts } from "@/src/lib/services/payouts";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const kind = body.kind ?? "seller";
  const end = new Date();
  const start = new Date(end.getTime() - (kind === "seller" ? 7 : 30) * 24 * 3600 * 1000);
  const result = kind === "seller" ? await runSellerPayouts(start, end) : await runAffiliatePayouts(start, end);
  return NextResponse.json({ ok: true, ...result });
}
