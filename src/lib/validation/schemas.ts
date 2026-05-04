import { z } from "zod";

export const Role = z.enum(["customer", "seller", "admin"]);
export type Role = z.infer<typeof Role>;

export const SellerStatus = z.enum([
  "none",
  "pending_approval",
  "approved",
  "rejected",
  "suspended",
  "banned",
]);

export const TierEnum = z.enum(["free_trial", "basic", "pro", "enterprise"]);

export const passwordSchema = z
  .string()
  .min(8, "Min 8 chars")
  .regex(/[A-Z]/, "Need uppercase")
  .regex(/[a-z]/, "Need lowercase")
  .regex(/[0-9]/, "Need number");

export const emailSchema = z.string().email();

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1).max(80),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const sellerOnboardingSchema = z.object({
  businessName: z.string().min(2).max(120),
  description: z.string().min(10).max(2000),
  contactEmail: emailSchema,
});

export const productCreateSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(10).max(8000),
  priceCents: z.number().int().nonnegative().max(10_000_000),
  categoryIds: z.array(z.string()).min(1),
  productType: z.enum([
    "pdf",
    "video",
    "audio",
    "software",
    "image",
    "3d_model",
    "document",
    "other",
  ]),
  isSoftware: z.boolean().default(false),
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(4000),
});

export const discountCodeSchema = z.object({
  code: z.string().min(3).max(40).regex(/^[A-Z0-9_-]+$/i),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0).max(100000),
  applicableProductIds: z.array(z.string()).default([]),
  startDate: z.string(),
  endDate: z.string(),
  maxUses: z.number().int().positive().nullable().default(null),
});

export const bundleSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(10).max(4000),
  productIds: z.array(z.string()).min(2),
  bundlePriceCents: z.number().int().nonnegative(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).default(""),
  parentId: z.string().nullable().default(null),
});

export const cookieDuration = z.union([
  z.literal(30),
  z.literal(60),
  z.literal(90),
]);

export const platformConfigSchema = z.object({
  tiers: z.array(
    z.object({
      id: TierEnum,
      productLimit: z.number().int(),
      storageLimitGB: z.number().int().positive(),
      commissionRate: z.number().min(0).max(100),
      monthlyPriceCents: z.number().int().nonnegative(),
    }),
  ),
  affiliateCommissionRate: z.number().min(0).max(100),
  sellerPayoutThresholdCents: z.number().int().nonnegative(),
  affiliatePayoutThresholdCents: z.number().int().nonnegative(),
  downloadWindowDays: z.number().int().positive(),
});
