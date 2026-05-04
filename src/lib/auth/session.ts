import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me-please-32chars-min",
);
const COOKIE = "mp_session";
const SESSION_HOURS = 24;

export interface SessionPayload {
  uid: string;
  role: "customer" | "seller" | "admin";
  email: string;
  name: string;
}

export async function signSession(p: SessionPayload): Promise<string> {
  return await new SignJWT(p as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(SECRET);
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function clearSessionCookie() {
  cookies().delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const tok = cookies().get(COOKIE)?.value;
  if (!tok) return null;
  return await verifySession(tok);
}

export const SESSION_COOKIE = COOKIE;
