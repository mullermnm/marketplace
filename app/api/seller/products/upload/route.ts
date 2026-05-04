import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { productsRepo } from "@/src/lib/repos/products";
import { storage, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/src/lib/services/storage";
import { attachFile, publishNewVersion } from "@/src/lib/services/products";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fd = await req.formData();
  const file = fd.get("file") as File | null;
  const productId = String(fd.get("productId"));
  const newVersion = fd.get("newVersion") === "1";
  if (!file || !productId)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const product = productsRepo.byId(productId);
  if (!product || product.sellerId !== session.uid)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (file.size > MAX_FILE_SIZE)
    return NextResponse.json({ error: "File too large (max 5GB)" }, { status: 400 });
  if (file.type && !ALLOWED_FILE_TYPES.has(file.type)) {
    // Be permissive but warn
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
  const key = `products/${productId}/${Date.now()}_${safeName}`;
  const stored = await storage().put(key, buf);
  try {
    if (newVersion) {
      await publishNewVersion(productId, {
        fileName: safeName,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
        filePath: key,
      });
    } else {
      attachFile(productId, {
        fileName: safeName,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
        filePath: key,
      });
    }
  } catch (e: any) {
    await storage().remove(key);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, sha256: stored.sha256 });
}
