import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { usersRepo } from "@/src/lib/repos/users";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fd = await req.formData();
  const userId = String(fd.get("userId"));
  const rate = parseFloat(String(fd.get("rate") ?? "0"));
  if (isNaN(rate) || rate < 0 || rate > 50)
    return NextResponse.json({ error: "Bad rate" }, { status: 400 });
  const u = usersRepo.byId(userId);
  if (!u?.sellerProfile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  usersRepo.update(u.id, {
    sellerProfile: { ...u.sellerProfile, customCommissionRate: rate },
  });
  return NextResponse.redirect(new URL("/admin/sellers", req.url));
}
