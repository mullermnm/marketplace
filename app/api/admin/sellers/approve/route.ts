import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { usersRepo } from "@/src/lib/repos/users";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { emailProvider, Templates } from "@/src/lib/services/email";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fd = await req.formData();
  const userId = String(fd.get("userId"));
  const u = usersRepo.byId(userId);
  if (!u || !u.sellerProfile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  usersRepo.update(u.id, {
    role: "seller",
    sellerProfile: {
      ...u.sellerProfile,
      status: "approved",
      approvedAt: new Date().toISOString(),
    },
  });
  if (!subsRepo.byUserId(u.id)) subsRepo.create(u.id, "free_trial");
  await emailProvider().send({
    to: u.email,
    ...Templates.sellerApproved(u.name),
  });
  return NextResponse.redirect(new URL("/admin/sellers/pending", req.url));
}
