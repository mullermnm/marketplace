import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { categoriesRepo } from "@/src/lib/repos/categories";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fd = await req.formData();
  const id = String(fd.get("id"));
  const name = String(fd.get("name") ?? "").trim();
  const description = String(fd.get("description") ?? "");
  if (name.length < 2)
    return NextResponse.json({ error: "Name too short" }, { status: 400 });
  categoriesRepo.update(id, { name, description });
  return NextResponse.redirect(new URL("/admin/categories", req.url));
}
