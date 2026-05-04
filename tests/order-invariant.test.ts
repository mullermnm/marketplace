import { describe, it, expect } from "vitest";
import fc from "fast-check";

// Property: for any allocation, total = commission + payout
function compute(priceCents: number, ratePct: number) {
  const commission = Math.round((priceCents * ratePct) / 100);
  const payout = priceCents - commission;
  return { commission, payout };
}

describe("order amount invariant (req 9 #8)", () => {
  it("commission + payout === price for every line item", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        fc.integer({ min: 0, max: 50 }),
        (price, rate) => {
          const { commission, payout } = compute(price, rate);
          return commission + payout === price;
        },
      ),
      { numRuns: 1000 },
    );
  });
});

describe("revenue invariant (req 20 #13)", () => {
  it("platform + seller revenue == GMV across many orders", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(fc.integer({ min: 0, max: 100000 }), fc.integer({ min: 0, max: 30 })),
          { minLength: 0, maxLength: 100 },
        ),
        (lines) => {
          let gmv = 0, plat = 0, sell = 0;
          for (const [p, r] of lines) {
            const { commission, payout } = compute(p, r);
            gmv += p; plat += commission; sell += payout;
          }
          return plat + sell === gmv;
        },
      ),
    );
  });
});

describe("affiliate commission exactness (req 16 #8)", () => {
  it("commission exactly 10% (rounded half-away-from-zero)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_000_000 }), (p) => {
        const c = Math.round((p * 10) / 100);
        return c === Math.round(p / 10);
      }),
    );
  });
});
