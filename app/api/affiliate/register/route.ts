import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { registerAffiliate } from "@/src/lib/services/affiliate";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  registerAffiliate(session.uid);
  return NextResponse.redirect(new URL("/affiliate/dashboard", req.url));
}
