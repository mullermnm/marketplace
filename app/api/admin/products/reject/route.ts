import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { rejectProduct } from "@/src/lib/services/products";
import { emailProvider } from "@/src/lib/services/email";
import { productsRepo } from "@/src/lib/repos/products";
import { usersRepo } from "@/src/lib/repos/users";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fd = await req.formData();
  const id = String(fd.get("productId"));
  const reason = String(fd.get("reason"));
  rejectProduct(id, session.uid, reason);
  const p = productsRepo.byId(id);
  if (p) {
    const seller = usersRepo.byId(p.sellerId);
    if (seller) {
      await emailProvider().send({
        to: seller.email,
        subject: `Product "${p.title}" rejected`,
        html: `<p>Your product was rejected: ${reason}</p>`,
      });
    }
  }
  return NextResponse.redirect(new URL("/admin/products/pending", req.url));
}
