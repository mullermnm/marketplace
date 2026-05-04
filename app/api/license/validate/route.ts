import { NextRequest, NextResponse } from "next/server";
import { ordersRepo } from "@/src/lib/repos/orders";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const key = String(body.key ?? "").trim();
  const productId = body.productId ? String(body.productId) : undefined;
  if (!/^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(key))
    return NextResponse.json({ valid: false, error: "Bad format" }, { status: 200 });
  for (const o of ordersRepo.all()) {
    for (const i of o.items) {
      if (i.licenseKey === key && !i.refunded) {
        // Only confirm validity for the productId the caller already knows.
        if (productId && i.productId !== productId) {
          return NextResponse.json({ valid: false }, { status: 200 });
        }
        return NextResponse.json({ valid: true });
      }
    }
  }
  return NextResponse.json({ valid: false }, { status: 200 });
}
