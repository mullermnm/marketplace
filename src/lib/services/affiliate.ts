import { cookies } from "next/headers";
import { affiliatesRepo, clicksRepo } from "../repos/misc";
import { newAffiliateId } from "../ids";
import { productsRepo } from "../repos/products";

const COOKIE = "mp_aff";

export function registerAffiliate(userId: string, duration: 30 | 60 | 90 = 60) {
  const existing = affiliatesRepo.byUserId(userId);
  if (existing) return existing;
  const aid = newAffiliateId();
  return affiliatesRepo.create({
    userId,
    affiliateId: aid,
    trackingCookieDuration: duration,
  });
}

export function buildReferralLink(affiliateId: string, productId: string, base: string) {
  const u = new URL(`${base}/api/affiliate/track`);
  u.searchParams.set("aff", affiliateId);
  u.searchParams.set("p", productId);
  return u.toString();
}

export function recordClick(input: {
  affiliateId: string;
  productId: string;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
}) {
  const aff = affiliatesRepo.byAffiliateId(input.affiliateId);
  if (!aff) return null;
  const product = productsRepo.byId(input.productId);
  if (!product) return null;
  clicksRepo.create({
    affiliateId: input.affiliateId,
    productId: input.productId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    referrer: input.referrer,
  });
  // update referralLinks aggregate
  const links = aff.referralLinks.slice();
  const idx = links.findIndex((l: any) => l.productId === input.productId);
  if (idx === -1) {
    links.push({
      productId: input.productId,
      url: `?aff=${input.affiliateId}&p=${input.productId}`,
      clicks: 1,
      conversions: 0,
      revenueCents: 0,
    });
  } else {
    links[idx] = { ...links[idx], clicks: links[idx].clicks + 1 };
  }
  affiliatesRepo.update(aff.id, { referralLinks: links });
  // set cookie
  cookies().set(COOKIE, input.affiliateId, {
    path: "/",
    sameSite: "lax",
    maxAge: aff.trackingCookieDuration * 24 * 3600,
    httpOnly: true,
  });
  return aff;
}

export function readAffiliateCookie() {
  return cookies().get(COOKIE)?.value;
}

export const AFFILIATE_COOKIE = COOKIE;
