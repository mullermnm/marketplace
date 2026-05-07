import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { paddle } from "@/src/lib/services/paddle";
import { activateTier } from "@/src/lib/services/subscription";
import { TierId } from "@/src/lib/config/tiers";

/**
 * Called by the client after Paddle.js fires checkout.completed.
 * Pulls the transaction from Paddle, verifies it's actually paid, then
 * activates the seller's tier. Works without webhooks (so local dev is OK).
 * The webhook is still wired and acts as a safety net in production.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const transactionId = String(body.transactionId ?? "");
  if (!transactionId)
    return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });

  try {
    const tx = await paddle().getTransaction(transactionId);
    if (tx.status !== "completed" && tx.status !== "paid") {
      return NextResponse.json(
        { error: `Transaction not yet completed (status: ${tx.status})` },
        { status: 409 },
      );
    }
    const tierId =
      ((tx.customData as any)?.tierId as TierId) ?? null;
    const userId = (tx.customData as any)?.userId ?? session.uid;
    if (userId !== session.uid) {
      return NextResponse.json(
        { error: "Transaction belongs to another user" },
        { status: 403 },
      );
    }
    if (!tierId)
      return NextResponse.json(
        { error: "Transaction missing tierId metadata" },
        { status: 400 },
      );
    activateTier(session.uid, tierId, transactionId);
    return NextResponse.json({ ok: true, tier: tierId });
  } catch (e: any) {
    console.error("[subscription/confirm] paddle error", e);
    return NextResponse.json(
      { error: e?.message ?? "Confirm failed" },
      { status: 500 },
    );
  }
}
