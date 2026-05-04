import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { submitReview } from "@/src/lib/services/reviews";
import { reviewSchema } from "@/src/lib/validation/schemas";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  try {
    const body = reviewSchema.parse(await req.json());
    const r = submitReview({ customerId: session.uid, ...body });
    return NextResponse.json({ ok: true, review: r });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
