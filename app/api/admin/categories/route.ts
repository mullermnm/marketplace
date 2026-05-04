import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { categoriesRepo } from "@/src/lib/repos/categories";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fd = await req.formData();
  categoriesRepo.create({
    name: String(fd.get("name")),
    description: String(fd.get("description") ?? ""),
    parentId: fd.get("parentId") ? String(fd.get("parentId")) : null,
  });
  return NextResponse.redirect(new URL("/admin/categories", req.url));
}
