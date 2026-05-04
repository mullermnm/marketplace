import { NextRequest, NextResponse } from "next/server";
import { applyCode, readCart, resolveCart } from "@/src/lib/services/cart";

export async function POST(req: NextRequest) {
  const body = await req.json();
  applyCode(body.code ?? null);
  const resolved = resolveCart(readCart());
  return NextResponse.json({ ok: resolved.errors.length === 0, errors: resolved.errors });
}
