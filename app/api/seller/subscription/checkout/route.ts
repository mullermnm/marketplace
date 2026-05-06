import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { paddle } from "@/src/lib/services/paddle";
import { activateTier } from "@/src/lib/services/subscription";
import { TierId } from "@/src/lib/config/tiers";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  const fd = await req.formData();
  const tierId = String(fd.get("tierId")) as TierId;

  if (tierId === "free_trial") {
    activateTier(session.uid, "free_trial");
    return NextResponse.redirect(new URL("/seller/subscription?ok=1", req.url));
  }
  try {
    const checkout = await paddle().createSubscriptionCheckout({
      tierId,
      customerEmail: session.email,
      metadata: { userId: session.uid },
    });
    // Paddle URL is absolute; pass through directly.
    return NextResponse.redirect(checkout.checkoutUrl);
  } catch (e: any) {
    console.error("[subscription/checkout] paddle error", e);
    const url = new URL("/seller/subscription", req.url);
    url.searchParams.set("failed", "1");
    url.searchParams.set("err", (e?.message ?? "Checkout failed").slice(0, 200));
    return NextResponse.redirect(url);
  }
}
