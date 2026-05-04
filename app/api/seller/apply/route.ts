import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { usersRepo } from "@/src/lib/repos/users";
import { sellerOnboardingSchema } from "@/src/lib/validation/schemas";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const u = usersRepo.byId(session.uid);
  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (u.sellerProfile?.status === "banned")
    return NextResponse.json({ error: "Banned from re-applying" }, { status: 403 });
  try {
    const data = sellerOnboardingSchema.parse(await req.json());
    usersRepo.update(u.id, {
      sellerProfile: {
        businessName: data.businessName,
        description: data.description,
        contactEmail: data.contactEmail,
        status: "pending_approval",
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
