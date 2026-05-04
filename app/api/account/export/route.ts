import { NextRequest, NextResponse } from "next/server";
import { getSession, clearSessionCookie } from "@/src/lib/auth/session";
import { usersRepo } from "@/src/lib/repos/users";
import { ordersRepo } from "@/src/lib/repos/orders";
import { productsRepo } from "@/src/lib/repos/products";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { affiliatesRepo } from "@/src/lib/repos/misc";

export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const user = usersRepo.byId(session.uid);
  const orders = ordersRepo.byCustomer(session.uid);
  return NextResponse.json({
    user: user
      ? { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }
      : null,
    orders,
  });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  // Soft-delete: anonymise user data (keeps order integrity)
  const u = usersRepo.byId(session.uid);
  if (u) {
    // Suspend products so they stop being visible / purchaseable
    for (const p of productsRepo.bySeller(u.id)) {
      if (p.status === "active" || p.status === "pending_review") {
        productsRepo.update(p.id, { status: "suspended" });
      }
    }
    // Cancel any active subscription
    const sub = subsRepo.byUserId(u.id);
    if (sub) subsRepo.update(sub.id, { status: "cancelled" });
    // Deactivate affiliate
    const aff = affiliatesRepo.byUserId(u.id);
    if (aff) affiliatesRepo.update(aff.id, { isActive: false });
    // Anonymise the user
    usersRepo.update(u.id, {
      email: `deleted_${u.id}@local`,
      emailLower: `deleted_${u.id}@local`,
      name: "Deleted user",
      passwordHash: undefined,
      sellerProfile: undefined,
      affiliateProfile: undefined,
    });
    await clearSessionCookie();
  }
  return NextResponse.json({ ok: true });
}
