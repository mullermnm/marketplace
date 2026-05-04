import { productsRepo, ProductDoc } from "../repos/products";
import { canAddProduct, canStoreFile, bumpUsage } from "./subscription";
import { usersRepo } from "../repos/users";
import { ordersRepo } from "../repos/orders";
import { emailProvider, Templates } from "./email";
import { newId } from "../ids";

export function createProduct(input: {
  sellerId: string;
  title: string;
  description: string;
  priceCents: number;
  categoryIds: string[];
  productType: ProductDoc["productType"];
  isSoftware: boolean;
}): { ok: true; product: ProductDoc } | { ok: false; error: string } {
  const seller = usersRepo.byId(input.sellerId);
  if (!seller || seller.role !== "seller" || seller.sellerProfile?.status !== "approved") {
    return { ok: false, error: "Seller not approved" };
  }
  const limit = canAddProduct(input.sellerId);
  if (!limit.ok) return { ok: false, error: limit.reason ?? "Limit exceeded" };
  const product = productsRepo.create({
    ...input,
    status: "pending_review",
  });
  bumpUsage(input.sellerId, 1, 0);
  return { ok: true, product };
}

export function attachFile(
  productId: string,
  file: { fileName: string; fileSize: number; fileType: string; filePath: string },
) {
  const p = productsRepo.byId(productId);
  if (!p) return null;
  const limit = canStoreFile(p.sellerId, file.fileSize);
  if (!limit.ok) throw new Error(limit.reason);
  const newVersion = p.currentVersion;
  const fileEntry = {
    fileId: newId("fil"),
    ...file,
    version: newVersion,
    uploadedAt: new Date().toISOString(),
  };
  const updated = productsRepo.update(productId, {
    files: [...p.files, fileEntry],
  });
  bumpUsage(p.sellerId, 0, file.fileSize);
  return updated;
}

export async function publishNewVersion(
  productId: string,
  file: { fileName: string; fileSize: number; fileType: string; filePath: string },
) {
  const p = productsRepo.byId(productId);
  if (!p) return null;
  const newVersion = p.currentVersion + 1;
  const fileEntry = {
    fileId: newId("fil"),
    ...file,
    version: newVersion,
    uploadedAt: new Date().toISOString(),
  };
  productsRepo.update(productId, {
    files: [...p.files, fileEntry],
    currentVersion: newVersion,
  });
  bumpUsage(p.sellerId, 0, file.fileSize);

  // notify previous buyers
  const buyers = new Set<string>();
  for (const o of ordersRepo.all()) {
    if (
      o.paymentStatus === "completed" &&
      o.items.some((i) => i.productId === productId && !i.refunded)
    ) {
      buyers.add(o.customerId);
    }
  }
  for (const buyerId of Array.from(buyers)) {
    const buyer = usersRepo.byId(buyerId);
    if (buyer) {
      await emailProvider().send({
        to: buyer.email,
        ...Templates.productUpdated(p.title, `/orders`),
      });
    }
  }
  return productsRepo.byId(productId);
}

export function canDeleteProduct(productId: string) {
  const hasOrders = ordersRepo
    .all()
    .some((o) => o.items.some((i) => i.productId === productId));
  return !hasOrders;
}

export function approveProduct(productId: string, adminId: string) {
  return productsRepo.update(productId, {
    status: "active",
    moderatedBy: adminId,
    moderatedAt: new Date().toISOString(),
  });
}

export function rejectProduct(productId: string, adminId: string, reason: string) {
  return productsRepo.update(productId, {
    status: "rejected",
    moderatedBy: adminId,
    moderatedAt: new Date().toISOString(),
    rejectionReason: reason,
  });
}

export function suspendProduct(productId: string, adminId: string) {
  return productsRepo.update(productId, {
    status: "suspended",
    moderatedBy: adminId,
    moderatedAt: new Date().toISOString(),
  });
}
