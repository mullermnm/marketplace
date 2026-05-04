import { NextRequest, NextResponse } from "next/server";
import { consumeReset } from "@/src/lib/services/password-reset";
import { passwordSchema } from "@/src/lib/validation/schemas";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = String(body.token ?? "");
  const password = String(body.password ?? "");
  const valid = passwordSchema.safeParse(password);
  if (!valid.success)
    return NextResponse.json({ error: valid.error.issues[0].message }, { status: 400 });
  try {
    await consumeReset(token, password);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
