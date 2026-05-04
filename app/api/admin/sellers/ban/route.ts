import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { usersRepo } from "@/src/lib/repos/users";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { productsRepo } from "@/src/lib/repos/products";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fd = await req.formData();
  const userId = String(fd.get("userId"));
  const u = usersRepo.byId(userId);
  if (!u?.sellerProfile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  usersRepo.update(u.id, { sellerProfile: { ...u.sellerProfile, status: "banned" } });
  const sub = subsRepo.byUserId(u.id);
  if (sub) subsRepo.update(sub.id, { status: "cancelled" });
  for (const p of productsRepo.bySeller(u.id)) {
    productsRepo.update(p.id, { status: "banned" });
  }
  return NextResponse.redirect(new URL("/admin/sellers", req.url));
}
