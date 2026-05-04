import { redirect } from "next/navigation";
import { getSession, SessionPayload } from "./session";

export async function requireUser(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) redirect("/login?next=/");
  return s!;
}

export async function requireRole(
  role: "customer" | "seller" | "admin",
): Promise<SessionPayload> {
  const s = await requireUser();
  if (role === "admin" && s.role !== "admin") redirect("/");
  if (role === "seller" && s.role !== "seller" && s.role !== "admin")
    redirect("/seller/onboarding");
  return s;
}
