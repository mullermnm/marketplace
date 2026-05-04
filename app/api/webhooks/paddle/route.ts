import { NextRequest, NextResponse } from "next/server";
import { paddle } from "@/src/lib/services/paddle";
import { activateTier, recordPaymentFailure } from "@/src/lib/services/subscription";
import { usersRepo } from "@/src/lib/repos/users";
import { TierId } from "@/src/lib/config/tiers";

// Real Paddle webhook handler. (Stub forwards to simulate route in dev.)
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("paddle-signature");
  if (!paddle().verifyWebhook(raw, sig))
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  const evt = JSON.parse(raw);
  const type: string = evt.event_type;
  const data = evt.data ?? {};

  switch (type) {
    case "subscription.created":
    case "subscription.updated":
    case "subscription.activated": {
      const email: string = data.customer?.email;
      const tier: TierId = data.custom_data?.tierId ?? "basic";
      const user = email ? usersRepo.byEmail(email) : null;
      if (user) activateTier(user.id, tier, data.id);
      break;
    }
    case "subscription.cancelled": {
      const email: string = data.customer?.email;
      const user = email ? usersRepo.byEmail(email) : null;
      if (user) activateTier(user.id, "free_trial");
      break;
    }
    case "subscription.payment_failed": {
      const email: string = data.customer?.email;
      const user = email ? usersRepo.byEmail(email) : null;
      if (user) recordPaymentFailure(user.id);
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
