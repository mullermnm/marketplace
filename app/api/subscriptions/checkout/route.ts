import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { paddle } from "@/src/lib/services/paddle";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { priceId, subscriptionTier, billingCycle } = body;

    if (!priceId || !subscriptionTier) {
      return NextResponse.json(
        { error: "Missing required fields: priceId, subscriptionTier" },
        { status: 400 }
      );
    }

    const checkout = await paddle().createInlineSubscriptionCheckout({
      tierId: subscriptionTier,
      customerEmail: session.email,
      metadata: { 
        userId: session.uid,
        subscriptionTier,
        billingCycle: billingCycle || 'monthly'
      },
    });

    return NextResponse.json({ 
      transactionId: checkout.transactionId,
      priceId: checkout.priceId 
    });
  } catch (error: any) {
    console.error("[subscriptions/checkout] error", error);
    return NextResponse.json(
      { error: error?.message ?? "Checkout failed" },
      { status: 500 }
    );
  }
}