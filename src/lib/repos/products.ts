import { store } from "../db/store";
import { newId } from "../ids";

export interface ProductFile {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  version: number;
  uploadedAt: string;
}

export interface ProductDoc {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  priceCents: number;
  categoryIds: string[];
  files: ProductFile[];
  currentVersion: number;
  productType:
    | "pdf"
    | "video"
    | "audio"
    | "software"
    | "image"
    | "3d_model"
    | "document"
    | "other";
  isSoftware: boolean;
  images: string[];
  thumbnailUrl: string;
  status:
    | "draft"
    | "pending_review"
    | "active"
    | "rejected"
    | "suspended"
    | "banned";
  rejectionReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  viewCount: number;
  purchaseCount: number;
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  createdAt: string;
  updatedAt: string;
}

export const productsRepo = {
  create(input: Partial<ProductDoc> & { sellerId: string; title: string }) {
    const now = new Date().toISOString();
    const doc: ProductDoc = {
      id: newId("prd"),
      sellerId: input.sellerId,
      title: input.title,
      description: input.description ?? "",
      priceCents: input.priceCents ?? 0,
      categoryIds: input.categoryIds ?? [],
      files: input.files ?? [],
      currentVersion: 1,
      productType: input.productType ?? "other",
      isSoftware: input.isSoftware ?? false,
      images: input.images ?? [],
      thumbnailUrl: input.thumbnailUrl ?? "",
      status: input.status ?? "pending_review",
      viewCount: 0,
      purchaseCount: 0,
      averageRating: 0,
      reviewCount: 0,
      isFeatured: false,
      isTrending: false,
      createdAt: now,
      updatedAt: now,
    };
    return store.products.insert(doc);
  },
  byId(id: string): ProductDoc | null {
    return store.products.findById(id);
  },
  update(id: string, patch: Partial<ProductDoc>) {
    return store.products.update(id, patch);
  },
  bySeller(sellerId: string): ProductDoc[] {
    return store.products.find((p: ProductDoc) => p.sellerId === sellerId);
  },
  byStatus(status: ProductDoc["status"]): ProductDoc[] {
    return store.products.find((p: ProductDoc) => p.status === status);
  },
  active(): ProductDoc[] {
    return store.products.find((p: ProductDoc) => p.status === "active");
  },
  search(opts: {
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sellerId?: string;
    productType?: ProductDoc["productType"];
    categoryId?: string;
  }): ProductDoc[] {
    const ql = opts.q?.toLowerCase().trim();
    return this.active().filter((p) => {
      if (
        ql &&
        !p.title.toLowerCase().includes(ql) &&
        !p.description.toLowerCase().includes(ql)
      )
        return false;
      if (opts.minPrice != null && p.priceCents < opts.minPrice) return false;
      if (opts.maxPrice != null && p.priceCents > opts.maxPrice) return false;
      if (opts.minRating != null && p.averageRating < opts.minRating)
        return false;
      if (opts.sellerId && p.sellerId !== opts.sellerId) return false;
      if (opts.productType && p.productType !== opts.productType) return false;
      if (opts.categoryId && !p.categoryIds.includes(opts.categoryId))
        return false;
      return true;
    });
  },
  trending(limit = 8): ProductDoc[] {
    return [...this.active()]
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, limit);
  },
  featured(limit = 8): ProductDoc[] {
    return this.active().filter((p) => p.isFeatured).slice(0, limit);
  },
  delete(id: string) {
    return store.products.remove(id);
  },
  count(pred?: (p: ProductDoc) => boolean) {
    return store.products.count(pred as any);
  },
};
