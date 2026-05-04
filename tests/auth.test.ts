import { describe, it, expect, beforeEach } from "vitest";
import { hashPassword, verifyPassword } from "@/src/lib/auth/password";
import { signSession, verifySession } from "@/src/lib/auth/session";

describe("password hashing", () => {
  it("verifies correct, rejects wrong", async () => {
    const hash = await hashPassword("Test123!");
    expect(await verifyPassword("Test123!", hash)).toBe(true);
    expect(await verifyPassword("Wrong123!", hash)).toBe(false);
  });
});

describe("session JWT (req 1 #8 idempotence)", () => {
  it("sign → verify → sign → verify yields same payload", async () => {
    const payload = { uid: "u1", role: "customer" as const, email: "a@b.c", name: "A" };
    const t1 = await signSession(payload);
    const v1 = await verifySession(t1);
    expect(v1?.uid).toBe(payload.uid);
    const t2 = await signSession(v1!);
    const v2 = await verifySession(t2);
    expect(v2?.uid).toBe(payload.uid);
    expect(v2?.role).toBe(v1?.role);
  });
  it("rejects garbage", async () => {
    expect(await verifySession("garbage.token.here")).toBeNull();
  });
});
