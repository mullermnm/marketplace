import { store } from "../db/store";
import { newId } from "../ids";
import { TIERS, TierId } from "../config/tiers";

export interface SubscriptionDoc {
  id: string;
  userId: string;
  tier: TierId;
  status: "active" | "cancelled" | "suspended" | "past_due";
  paddleSubscriptionId?: string;
  paddleCustomerId?: string;
  productLimit: number;
  storageLimitGB: number;
  commissionRate: number;
  currentProductCount: number;
  currentStorageBytes: number;
  billingCycle: "monthly" | "yearly";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  failedPaymentAttempts: number;
  lastPaymentFailure?: string;
  createdAt: string;
  updatedAt: string;
}

export const subsRepo = {
  byUserId(userId: string): SubscriptionDoc | null {
    return store.subscriptions.findOne(
      (s: SubscriptionDoc) => s.userId === userId,
    );
  },
  create(userId: string, tier: TierId): SubscriptionDoc {
    const t = TIERS[tier];
    const now = new Date();
    const doc: SubscriptionDoc = {
      id: newId("sub"),
      userId,
      tier,
      status: "active",
      productLimit: t.productLimit,
      storageLimitGB: t.storageLimitGB,
      commissionRate: t.commissionRate,
      currentProductCount: 0,
      currentStorageBytes: 0,
      billingCycle: "monthly",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: new Date(
        now.getTime() + 30 * 24 * 3600 * 1000,
      ).toISOString(),
      cancelAtPeriodEnd: false,
      failedPaymentAttempts: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    return store.subscriptions.insert(doc);
  },
  changeTier(userId: string, tier: TierId): SubscriptionDoc | null {
    const sub = this.byUserId(userId);
    if (!sub) return null;
    const t = TIERS[tier];
    return store.subscriptions.update(sub.id, {
      tier,
      productLimit: t.productLimit,
      storageLimitGB: t.storageLimitGB,
      commissionRate: t.commissionRate,
      status: "active",
      failedPaymentAttempts: 0,
    });
  },
  update(id: string, patch: Partial<SubscriptionDoc>) {
    return store.subscriptions.update(id, patch);
  },
};
