export type TierId = "free_trial" | "basic" | "pro" | "enterprise";

export interface TierConfig {
  id: TierId;
  name: string;
  productLimit: number; // -1 unlimited
  storageLimitGB: number;
  commissionRate: number; // percentage
  monthlyPriceCents: number;
}

export const TIERS: Record<TierId, TierConfig> = {
  free_trial: {
    id: "free_trial",
    name: "Free Trial",
    productLimit: 5,
    storageLimitGB: 5,
    commissionRate: 10,
    monthlyPriceCents: 0,
  },
  basic: {
    id: "basic",
    name: "Basic",
    productLimit: 50,
    storageLimitGB: 50,
    commissionRate: 7,
    monthlyPriceCents: 1900,
  },
  pro: {
    id: "pro",
    name: "Pro",
    productLimit: 500,
    storageLimitGB: 500,
    commissionRate: 5,
    monthlyPriceCents: 4900,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    productLimit: -1,
    storageLimitGB: 2000,
    commissionRate: 3,
    monthlyPriceCents: 19900,
  },
};

export const TIER_ORDER: TierId[] = ["free_trial", "basic", "pro", "enterprise"];

export function getTier(id: TierId): TierConfig {
  return TIERS[id];
}
