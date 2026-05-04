import { NextRequest, NextResponse } from "next/server";
import { removeFromCart } from "@/src/lib/services/cart";

export async function POST(req: NextRequest) {
  const body = await req.json();
  removeFromCart({ type: body.type, id: body.id });
  return NextResponse.json({ ok: true });
}
