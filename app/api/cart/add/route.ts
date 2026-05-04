import { NextRequest, NextResponse } from "next/server";
import { addToCart } from "@/src/lib/services/cart";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.type !== "product" && body.type !== "bundle")
    return NextResponse.json({ error: "Bad type" }, { status: 400 });
  if (typeof body.id !== "string")
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  addToCart({ type: body.type, id: body.id });
  return NextResponse.json({ ok: true });
}
