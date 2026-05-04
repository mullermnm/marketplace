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
  const checkout = await paddle().createSubscriptionCheckout({
    tierId,
    customerEmail: session.email,
    metadata: { userId: session.uid },
  });
  return NextResponse.redirect(new URL(checkout.checkoutUrl, req.url));
}
