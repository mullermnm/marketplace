import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { paddle } from "@/src/lib/services/paddle";
import { activateTier } from "@/src/lib/services/subscription";
import { TierId } from "@/src/lib/config/tiers";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  // Accept either JSON body { tierId } or form-data tierId
  let tierId: TierId | undefined;
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    tierId = body.tierId;
  } else {
    const fd = await req.formData();
    const v = fd.get("tierId");
    if (v) tierId = String(v) as TierId;
  }
  if (!tierId)
    return NextResponse.json({ error: "Missing tierId" }, { status: 400 });

  if (tierId === "free_trial") {
    activateTier(session.uid, "free_trial");
    return NextResponse.json({ ok: true, tier: "free_trial" });
  }

  try {
    const checkout = await paddle().createInlineSubscriptionCheckout({
      tierId,
      customerEmail: session.email,
      metadata: { userId: session.uid, tierId },
    });
    return NextResponse.json({
      transactionId: checkout.transactionId,
      priceId: checkout.priceId,
    });
  } catch (e: any) {
    console.error("[subscription/checkout] paddle error", e);
    return NextResponse.json(
      { error: e?.message ?? "Checkout failed" },
      { status: 500 },
    );
  }
}
