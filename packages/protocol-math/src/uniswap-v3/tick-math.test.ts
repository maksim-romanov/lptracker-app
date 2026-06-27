import { priceRangeFromTicks, tickToPrice } from "./tick-math";
import { describe, expect, it } from "bun:test";

const relClose = (actual: number, expected: number, tol = 1e-9) => Math.abs(actual / expected - 1) < tol;

describe("tickToPrice", () => {
  it("returns 1 when tick is 0 and decimals are equal", () => {
    expect(relClose(tickToPrice(0, 18, 18), 1)).toBe(true);
  });

  it("applies the decimal exponent at tick 0 (base 18 / quote 6 => 1e12)", () => {
    expect(relClose(tickToPrice(0, 18, 6), 1e12)).toBe(true);
  });

  it("applies the decimal exponent at tick 0 (base 6 / quote 18 => 1e-12)", () => {
    expect(relClose(tickToPrice(0, 6, 18), 1e-12)).toBe(true);
  });

  it("is monotonically increasing in tick", () => {
    const lo = tickToPrice(-100, 18, 18);
    const mid = tickToPrice(0, 18, 18);
    const hi = tickToPrice(100, 18, 18);
    expect(lo < mid && mid < hi).toBe(true);
  });

  it("anchors the 1.0001^tick curve at a non-zero tick (golden value)", () => {
    expect(relClose(tickToPrice(10000, 18, 18), 2.7181459268249255)).toBe(true);
  });
});

describe("priceRangeFromTicks", () => {
  const base = {
    tickLower: -887220,
    tickUpper: 887220,
    currentTick: 0,
    baseDecimals: 18,
    quoteDecimals: 6,
  };

  it("maps lower->min, current->current, upper->max when not inverted", () => {
    const r = priceRangeFromTicks({ ...base, inverted: false });
    expect(relClose(r.min, tickToPrice(base.tickLower, 18, 6))).toBe(true);
    expect(relClose(r.current, tickToPrice(base.currentTick, 18, 6))).toBe(true);
    expect(relClose(r.max, tickToPrice(base.tickUpper, 18, 6))).toBe(true);
  });

  it("inverts and swaps bounds when inverted (min = 1/upper, max = 1/lower)", () => {
    const direct = priceRangeFromTicks({ ...base, inverted: false });
    const inv = priceRangeFromTicks({ ...base, inverted: true });
    expect(relClose(inv.min, 1 / direct.max)).toBe(true);
    expect(relClose(inv.current, 1 / direct.current)).toBe(true);
    expect(relClose(inv.max, 1 / direct.min)).toBe(true);
  });
});
