import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { categoriesRepo } from "@/src/lib/repos/categories";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fd = await req.formData();
  const id = String(fd.get("id"));
  const c = categoriesRepo.byId(id);
  if (c && c.productCount === 0) categoriesRepo.delete(id);
  return NextResponse.redirect(new URL("/admin/categories", req.url));
}
