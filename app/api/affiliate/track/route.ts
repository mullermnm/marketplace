import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/src/lib/services/affiliate";

export async function GET(req: NextRequest) {
  const aff = req.nextUrl.searchParams.get("aff");
  const p = req.nextUrl.searchParams.get("p");
  if (!aff || !p) return NextResponse.json({ error: "Missing params" }, { status: 400 });
  // Validate input shape so we don't redirect to arbitrary paths
  if (!/^[A-Z0-9]{6,20}$/.test(aff) || !/^prd_[A-Za-z0-9]{8,}$/.test(p))
    return NextResponse.json({ error: "Bad params" }, { status: 400 });
  const result = recordClick({
    affiliateId: aff,
    productId: p,
    ipAddress: req.headers.get("x-forwarded-for") ?? "local",
    userAgent: req.headers.get("user-agent") ?? "unknown",
    referrer: req.headers.get("referer") ?? undefined,
  });
  // If affiliate or product doesn't exist, redirect anyway but no cookie was set.
  return NextResponse.redirect(new URL(`/products/${encodeURIComponent(p)}`, req.url));
}
