import { subsRepo, SubscriptionDoc } from "../repos/subscriptions";
import { usersRepo } from "../repos/users";
import { TIERS, TierId } from "../config/tiers";

export function effectiveCommissionRate(sellerId: string): number {
  const user = usersRepo.byId(sellerId);
  if (user?.sellerProfile?.customCommissionRate != null) {
    return user.sellerProfile.customCommissionRate;
  }
  const sub = subsRepo.byUserId(sellerId);
  return sub?.commissionRate ?? TIERS.free_trial.commissionRate;
}

export function canAddProduct(sellerId: string): { ok: boolean; reason?: string } {
  const sub = subsRepo.byUserId(sellerId);
  if (!sub) return { ok: false, reason: "No active subscription" };
  if (sub.productLimit < 0) return { ok: true };
  if (sub.currentProductCount >= sub.productLimit)
    return {
      ok: false,
      reason: `Product limit (${sub.productLimit}) reached for ${sub.tier} tier`,
    };
  return { ok: true };
}

export function canStoreFile(
  sellerId: string,
  fileSizeBytes: number,
): { ok: boolean; reason?: string } {
  const sub = subsRepo.byUserId(sellerId);
  if (!sub) return { ok: false, reason: "No active subscription" };
  const limitBytes = sub.storageLimitGB * 1024 * 1024 * 1024;
  if (sub.currentStorageBytes + fileSizeBytes > limitBytes) {
    return {
      ok: false,
      reason: `Storage limit (${sub.storageLimitGB}GB) would be exceeded`,
    };
  }
  return { ok: true };
}

export function bumpUsage(sellerId: string, productDelta: number, bytesDelta: number) {
  const sub = subsRepo.byUserId(sellerId);
  if (!sub) return;
  subsRepo.update(sub.id, {
    currentProductCount: Math.max(0, sub.currentProductCount + productDelta),
    currentStorageBytes: Math.max(0, sub.currentStorageBytes + bytesDelta),
  });
}

export function activateTier(userId: string, tier: TierId, paddleSubId?: string) {
  let sub = subsRepo.byUserId(userId);
  if (!sub) sub = subsRepo.create(userId, tier);
  else sub = subsRepo.changeTier(userId, tier)!;
  if (paddleSubId)
    subsRepo.update(sub.id, { paddleSubscriptionId: paddleSubId, status: "active" });
  return sub;
}

export function recordPaymentFailure(userId: string): SubscriptionDoc | null {
  const sub = subsRepo.byUserId(userId);
  if (!sub) return null;
  const failures = sub.failedPaymentAttempts + 1;
  const status = failures >= 3 ? "suspended" : "past_due";
  return subsRepo.update(sub.id, {
    failedPaymentAttempts: failures,
    status,
    lastPaymentFailure: new Date().toISOString(),
  });
}
