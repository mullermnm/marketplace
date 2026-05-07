import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { clearCart } from "@/src/lib/services/cart";

export async function POST(_req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  try {
    clearCart();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[cart/clear] error", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to clear cart" },
      { status: 500 }
    );
  }
}