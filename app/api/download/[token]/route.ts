import { NextRequest, NextResponse } from "next/server";
import { ordersRepo } from "@/src/lib/repos/orders";
import { productsRepo } from "@/src/lib/repos/products";
import { storage } from "@/src/lib/services/storage";
import { store } from "@/src/lib/db/store";
import { newId } from "@/src/lib/ids";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const found = ordersRepo.byDownloadToken(params.token);
  if (!found) return new NextResponse("Not found", { status: 404 });
  const { order, item } = found;
  if (item.refunded) return new NextResponse("Refunded", { status: 410 });
  if (Date.now() > new Date(item.downloadTokenExpiry).getTime())
    return new NextResponse("Download window expired", { status: 410 });

  const product = productsRepo.byId(item.productId);
  if (!product) return new NextResponse("Not found", { status: 404 });
  const file = product.files.find((f) => f.version === product.currentVersion) ?? product.files[product.files.length - 1];
  if (!file) {
    // Fallback: synthesize a tiny placeholder for demo seed without real file
    const body = `Demo download for ${product.title}\nLicense key: ${item.licenseKey ?? "n/a"}\n`;
    logDownload(order.id, item.productId, req);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${product.title.replace(/\s+/g,"_")}.txt"`,
      },
    });
  }
  let data: Buffer;
  try {
    data = await storage().read(file.filePath);
  } catch {
    return new NextResponse("File missing", { status: 404 });
  }
  // update item download count
  const newItems = order.items.map((i) =>
    i.downloadToken === params.token
      ? { ...i, downloadCount: i.downloadCount + 1, lastDownloadAt: new Date().toISOString() }
      : i,
  );
  ordersRepo.update(order.id, { items: newItems });
  logDownload(order.id, item.productId, req);
  const safeName = file.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": file.fileType,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Content-Length": String(file.fileSize),
    },
  });
}

function logDownload(orderId: string, productId: string, req: NextRequest) {
  store.downloadLogs.insert({
    id: newId("dlg"),
    orderId,
    productId,
    ip: req.headers.get("x-forwarded-for") ?? "local",
    at: new Date().toISOString(),
  });
}
