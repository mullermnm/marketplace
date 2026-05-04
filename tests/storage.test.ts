import { describe, it, expect } from "vitest";
import { storage } from "@/src/lib/services/storage";
import crypto from "node:crypto";

describe("storage round-trip (req 5 #10)", () => {
  it("put then read returns identical bytes", async () => {
    const buf = Buffer.from(crypto.randomBytes(1024));
    const key = `tests/${Date.now()}_${crypto.randomBytes(4).toString("hex")}.bin`;
    const out = await storage().put(key, buf);
    expect(out.sha256).toMatch(/^[0-9a-f]{64}$/);
    const back = await storage().read(key);
    expect(Buffer.compare(back, buf)).toBe(0);
    await storage().remove(key);
  });
});
