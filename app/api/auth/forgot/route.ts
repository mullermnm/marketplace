import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/src/lib/services/password-reset";
import { rateLimit } from "@/src/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`forgot:${ip}`, 5, 60_000))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await req.json();
  const email = String(body.email ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? new URL(req.url).origin;
  await requestPasswordReset(email, base);
  return NextResponse.json({ ok: true });
}
