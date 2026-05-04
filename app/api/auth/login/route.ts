import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/src/lib/services/auth";
import { setSessionCookie } from "@/src/lib/auth/session";
import { rateLimit } from "@/src/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`login:${ip}`, 30, 60_000))
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  try {
    const body = await req.json();
    const { token } = await authenticateUser(body, ip);
    await setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Login failed" }, { status: 400 });
  }
}
