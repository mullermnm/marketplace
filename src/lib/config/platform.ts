import { z } from "zod";
import { platformConfigSchema } from "@/src/lib/validation/schemas";
import { TIERS } from "./tiers";

export type PlatformConfig = z.infer<typeof platformConfigSchema>;

export const defaultConfig: PlatformConfig = {
  tiers: Object.values(TIERS).map((t) => ({
    id: t.id,
    productLimit: t.productLimit,
    storageLimitGB: t.storageLimitGB,
    commissionRate: t.commissionRate,
    monthlyPriceCents: t.monthlyPriceCents,
  })),
  affiliateCommissionRate: 10,
  sellerPayoutThresholdCents: 5000, // $50
  affiliatePayoutThresholdCents: 10000, // $100
  downloadWindowDays: 30,
};

export function parseConfig(json: string): PlatformConfig {
  const obj = JSON.parse(json);
  return platformConfigSchema.parse(obj);
}

export function serializeConfig(cfg: PlatformConfig): string {
  return JSON.stringify(platformConfigSchema.parse(cfg), null, 2);
}
