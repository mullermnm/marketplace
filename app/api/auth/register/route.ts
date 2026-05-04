import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/src/lib/services/auth";
import { setSessionCookie } from "@/src/lib/auth/session";
import { emailProvider, Templates } from "@/src/lib/services/email";
import { rateLimit } from "@/src/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`register:${ip}`, 10, 60_000))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  try {
    const body = await req.json();
    const { user, token } = await registerUser(body, ip);
    await setSessionCookie(token);
    await emailProvider().send({
      to: user.email,
      ...Templates.welcomeVerify(
        user.name,
        `${process.env.NEXT_PUBLIC_BASE_URL}/verify?u=${user.id}`,
      ),
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed" }, { status: 400 });
  }
}
