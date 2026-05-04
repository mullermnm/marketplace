import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { discountsRepo } from "@/src/lib/repos/misc";
import { discountCodeSchema } from "@/src/lib/validation/schemas";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "seller")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = discountCodeSchema.parse(await req.json());
    if (discountsRepo.byCode(data.code))
      return NextResponse.json({ error: "Code already exists" }, { status: 400 });
    const doc = discountsRepo.create({
      sellerId: session.uid,
      ...data,
    });
    return NextResponse.json({ ok: true, code: doc });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
