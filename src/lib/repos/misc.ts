import { store } from "../db/store";
import { newId } from "../ids";

export interface ReviewDoc {
  id: string;
  productId: string;
  customerId: string;
  orderId: string;
  rating: number;
  comment: string;
  sellerResponse?: { comment: string; respondedAt: string };
  isHidden: boolean;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const reviewsRepo = {
  create(input: Omit<ReviewDoc, "id" | "createdAt" | "updatedAt" | "isHidden" | "isEdited">) {
    const now = new Date().toISOString();
    const doc: ReviewDoc = {
      ...input,
      id: newId("rev"),
      isHidden: false,
      isEdited: false,
      createdAt: now,
      updatedAt: now,
    };
    return store.reviews.insert(doc);
  },
  byProduct(productId: string): ReviewDoc[] {
    return store.reviews.find((r: ReviewDoc) => r.productId === productId && !r.isHidden);
  },
  byOrderProduct(orderId: string, productId: string): ReviewDoc | null {
    return store.reviews.findOne(
      (r: ReviewDoc) => r.orderId === orderId && r.productId === productId,
    );
  },
  update(id: string, patch: Partial<ReviewDoc>) {
    return store.reviews.update(id, patch);
  },
  byId(id: string): ReviewDoc | null {
    return store.reviews.findById(id);
  },
};

export interface DiscountCodeDoc {
  id: string;
  sellerId: string;
  code: string;
  codeUpper: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  applicableProductIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxUses: number | null;
  currentUses: number;
  totalRevenueCents: number;
  totalDiscountCents: number;
  createdAt: string;
  updatedAt: string;
}

export const discountsRepo = {
  create(
    input: Omit<
      DiscountCodeDoc,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "isActive"
      | "currentUses"
      | "totalRevenueCents"
      | "totalDiscountCents"
      | "codeUpper"
    >,
  ) {
    const now = new Date().toISOString();
    const doc: DiscountCodeDoc = {
      ...input,
      id: newId("dsc"),
      codeUpper: input.code.toUpperCase(),
      isActive: true,
      currentUses: 0,
      totalRevenueCents: 0,
      totalDiscountCents: 0,
      createdAt: now,
      updatedAt: now,
    };
    return store.discountCodes.insert(doc);
  },
  byCode(code: string): DiscountCodeDoc | null {
    return store.discountCodes.findOne(
      (d: DiscountCodeDoc) => d.codeUpper === code.toUpperCase(),
    );
  },
  bySeller(sellerId: string): DiscountCodeDoc[] {
    return store.discountCodes.find(
      (d: DiscountCodeDoc) => d.sellerId === sellerId,
    );
  },
  update(id: string, patch: Partial<DiscountCodeDoc>) {
    return store.discountCodes.update(id, patch);
  },
};

export interface BundleDoc {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  products: { productId: string; title: string; individualPriceCents: number }[];
  individualTotalCents: number;
  bundlePriceCents: number;
  savingsCents: number;
  savingsPercentage: number;
  thumbnailUrl: string;
  status: "draft" | "active" | "inactive";
  viewCount: number;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
}

export const bundlesRepo = {
  create(input: Omit<BundleDoc, "id" | "createdAt" | "updatedAt" | "viewCount" | "purchaseCount">) {
    const now = new Date().toISOString();
    const doc: BundleDoc = {
      ...input,
      id: newId("bnd"),
      viewCount: 0,
      purchaseCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    return store.bundles.insert(doc);
  },
  byId(id: string) {
    return store.bundles.findById(id);
  },
  bySeller(sellerId: string): BundleDoc[] {
    return store.bundles.find((b: BundleDoc) => b.sellerId === sellerId);
  },
  active(): BundleDoc[] {
    return store.bundles.find((b: BundleDoc) => b.status === "active");
  },
  update(id: string, patch: Partial<BundleDoc>) {
    return store.bundles.update(id, patch);
  },
};

export interface AffiliateDoc {
  id: string;
  userId: string;
  affiliateId: string;
  referralLinks: { productId: string; url: string; clicks: number; conversions: number; revenueCents: number }[];
  totalEarningsCents: number;
  pendingCommissionsCents: number;
  paidCommissionsCents: number;
  trackingCookieDuration: 30 | 60 | 90;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const affiliatesRepo = {
  create(input: { userId: string; affiliateId: string; trackingCookieDuration: 30 | 60 | 90 }) {
    const now = new Date().toISOString();
    const doc: AffiliateDoc = {
      id: newId("aff"),
      userId: input.userId,
      affiliateId: input.affiliateId,
      referralLinks: [],
      totalEarningsCents: 0,
      pendingCommissionsCents: 0,
      paidCommissionsCents: 0,
      trackingCookieDuration: input.trackingCookieDuration,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    return store.affiliates.insert(doc);
  },
  byUserId(userId: string): AffiliateDoc | null {
    return store.affiliates.findOne((a: AffiliateDoc) => a.userId === userId);
  },
  byAffiliateId(aid: string): AffiliateDoc | null {
    return store.affiliates.findOne((a: AffiliateDoc) => a.affiliateId === aid);
  },
  update(id: string, patch: Partial<AffiliateDoc>) {
    return store.affiliates.update(id, patch);
  },
};

export interface CommissionDoc {
  id: string;
  affiliateId: string;
  orderId: string;
  productId: string;
  customerId: string;
  saleAmountCents: number;
  commissionRate: number;
  commissionCents: number;
  status: "pending" | "approved" | "paid";
  payoutId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const commissionsRepo = {
  create(input: Omit<CommissionDoc, "id" | "createdAt" | "updatedAt" | "status">) {
    const now = new Date().toISOString();
    const doc: CommissionDoc = {
      ...input,
      id: newId("cmn"),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    return store.commissions.insert(doc);
  },
  byAffiliate(affiliateId: string) {
    return store.commissions.find(
      (c: CommissionDoc) => c.affiliateId === affiliateId,
    );
  },
  pendingByAffiliate(affiliateId: string) {
    return this.byAffiliate(affiliateId).filter(
      (c: CommissionDoc) => c.status === "pending",
    );
  },
  update(id: string, patch: Partial<CommissionDoc>) {
    return store.commissions.update(id, patch);
  },
};

export interface PayoutDoc {
  id: string;
  recipientId: string;
  recipientType: "seller" | "affiliate";
  amountCents: number;
  currency: string;
  orderIds?: string[];
  commissionIds?: string[];
  paddlePayoutId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  periodStart: string;
  periodEnd: string;
  scheduledDate: string;
  completedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const payoutsRepo = {
  create(input: Omit<PayoutDoc, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const doc: PayoutDoc = { ...input, id: newId("pyo"), createdAt: now, updatedAt: now };
    return store.payouts.insert(doc);
  },
  byRecipient(recipientId: string) {
    return store.payouts.find((p: PayoutDoc) => p.recipientId === recipientId);
  },
  update(id: string, patch: Partial<PayoutDoc>) {
    return store.payouts.update(id, patch);
  },
};

export interface AffiliateClickDoc {
  id: string;
  affiliateId: string;
  productId: string;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  converted: boolean;
  orderId?: string;
  clickedAt: string;
}

export const clicksRepo = {
  create(input: Omit<AffiliateClickDoc, "id" | "clickedAt" | "converted">) {
    const doc: AffiliateClickDoc = {
      ...input,
      id: newId("clk"),
      converted: false,
      clickedAt: new Date().toISOString(),
    };
    return store.affiliateClicks.insert(doc);
  },
  byAffiliate(affiliateId: string) {
    return store.affiliateClicks.find(
      (c: AffiliateClickDoc) => c.affiliateId === affiliateId,
    );
  },
};

export interface FileDoc {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  ownerId: string;
  productId?: string;
  sha256: string;
  createdAt: string;
}

export const filesRepo = {
  create(input: Omit<FileDoc, "id" | "createdAt">) {
    const doc: FileDoc = { ...input, id: newId("fil"), createdAt: new Date().toISOString() };
    return store.files.insert(doc);
  },
  byId(id: string) {
    return store.files.findById(id) as FileDoc | null;
  },
};

export interface AuthAttemptDoc {
  id: string;
  email: string;
  ip: string;
  success: boolean;
  at: string;
}
export const authAttemptsRepo = {
  log(email: string, ip: string, success: boolean) {
    store.authAttempts.insert({
      id: newId("aut"),
      email: email.toLowerCase(),
      ip,
      success,
      at: new Date().toISOString(),
    });
  },
  recentFailuresByEmail(email: string, windowMs = 15 * 60 * 1000) {
    const since = Date.now() - windowMs;
    return store.authAttempts.find(
      (a: AuthAttemptDoc) =>
        a.email === email.toLowerCase() &&
        !a.success &&
        new Date(a.at).getTime() >= since,
    );
  },
};
