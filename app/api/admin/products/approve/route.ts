import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { approveProduct } from "@/src/lib/services/products";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fd = await req.formData();
  approveProduct(String(fd.get("productId")), session.uid);
  return NextResponse.redirect(new URL("/admin/products/pending", req.url));
}
