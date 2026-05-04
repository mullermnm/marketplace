import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { usersRepo } from "@/src/lib/repos/users";
import { emailProvider, Templates } from "@/src/lib/services/email";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fd = await req.formData();
  const userId = String(fd.get("userId"));
  const reason = String(fd.get("reason") ?? "Application did not meet requirements");
  const u = usersRepo.byId(userId);
  if (!u || !u.sellerProfile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  usersRepo.update(u.id, {
    sellerProfile: {
      ...u.sellerProfile,
      status: "rejected",
      rejectionReason: reason,
    },
  });
  await emailProvider().send({
    to: u.email,
    ...Templates.sellerRejected(u.name, reason),
  });
  return NextResponse.redirect(new URL("/admin/sellers/pending", req.url));
}
