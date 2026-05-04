import { store } from "../db/store";
import { newId, newToken } from "../ids";

export interface OrderItem {
  productId: string;
  sellerId: string;
  title: string;
  priceCents: number;
  commissionRate: number;
  commissionCents: number;
  sellerPayoutCents: number;
  licenseKey?: string;
  downloadToken: string;
  downloadTokenExpiry: string;
  downloadCount: number;
  lastDownloadAt?: string;
  refunded?: boolean;
}

export interface OrderDoc {
  id: string;
  customerId: string;
  items: OrderItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  totalCommissionCents: number;
  totalSellerPayoutCents: number;
  discountCodeId?: string;
  discountCodeUsed?: string;
  affiliateId?: string;
  affiliateCommissionCents?: number;
  paddleTransactionId: string;
  paddleCheckoutId: string;
  paymentStatus:
    | "pending"
    | "completed"
    | "failed"
    | "refunded"
    | "partially_refunded";
  refundAmountCents?: number;
  refundedAt?: string;
  refundReason?: string;
  fraudScore?: number;
  fraudFlags?: string[];
  requiresReview: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const ordersRepo = {
  create(input: Omit<OrderDoc, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const doc: OrderDoc = { ...input, id: newId("ord"), createdAt: now, updatedAt: now };
    return store.orders.insert(doc);
  },
  byId(id: string): OrderDoc | null {
    return store.orders.findById(id);
  },
  byCustomer(customerId: string): OrderDoc[] {
    return store.orders.find((o: OrderDoc) => o.customerId === customerId);
  },
  bySeller(sellerId: string): OrderDoc[] {
    return store.orders.find((o: OrderDoc) =>
      o.items.some((i) => i.sellerId === sellerId),
    );
  },
  byDownloadToken(token: string): { order: OrderDoc; item: OrderItem } | null {
    for (const o of store.orders.all() as OrderDoc[]) {
      const item = o.items.find((i) => i.downloadToken === token);
      if (item) return { order: o, item };
    }
    return null;
  },
  update(id: string, patch: Partial<OrderDoc>) {
    return store.orders.update(id, patch);
  },
  all(): OrderDoc[] {
    return store.orders.all();
  },
  flagged(): OrderDoc[] {
    return store.orders.find((o: OrderDoc) => o.requiresReview);
  },
  customerHasPurchased(customerId: string, productId: string): OrderDoc | null {
    return store.orders.findOne(
      (o: OrderDoc) =>
        o.customerId === customerId &&
        o.paymentStatus === "completed" &&
        o.items.some((i) => i.productId === productId && !i.refunded),
    );
  },
};

export function makeDownloadToken(downloadWindowDays: number) {
  return {
    downloadToken: newToken(),
    downloadTokenExpiry: new Date(
      Date.now() + downloadWindowDays * 24 * 3600 * 1000,
    ).toISOString(),
  };
}
