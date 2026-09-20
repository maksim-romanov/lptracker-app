import { derivePriceRangeVM, deriveRangeTone } from "../positions/price-range";
import { describe, expect, it } from "bun:test";
import type { PositionRange, TokensMap } from "#shared/contracts";

const tokens: TokensMap = {
  "1:0xa": { symbol: "WETH", decimals: 18, iconUrl: "" },
  "1:0xb": { symbol: "USDC", decimals: 6, iconUrl: "" },
};

const rangeOf = (lower: string | null, upper: string | null, current: string): PositionRange => ({
  lower,
  upper,
  current,
  baseTokenRef: "1:0xa",
  quoteTokenRef: "1:0xb",
});

// A ±10% band. Narrower than the ~±19% at which the fixed 5% cap starts to bind, so its edge is
// a share of the range — about a 2.9% move.
const tight = (current: string) => rangeOf("0.909", "1.100", current);

describe("deriveRangeTone", () => {
  it("keeps a price away from either bound plain in-range", () => {
    expect(deriveRangeTone(tight("1.0"))).toBe("in-range");
  });

  it("names the bound a price is approaching", () => {
    expect(deriveRangeTone(tight("0.923"))).toBe("near-lower");
    expect(deriveRangeTone(tight("1.083"))).toBe("near-upper");
  });

  it("measures the edge in price, so a wide range is not permanently at its bound", () => {
    // A tenth of this 1e12-fold span is a millionfold price move, so a fraction-of-the-band
    // rule could never let the position leave "near lower bound".
    const wide = (current: string) => rangeOf("0.000001", "1000000", current);
    expect(deriveRangeTone(wide("0.0000016"))).toBe("in-range");
    // Sitting a hair above the floor is still worth naming, whatever the span.
    expect(deriveRangeTone(wide("0.00000101"))).toBe("near-lower");
    expect(deriveRangeTone(wide("990000"))).toBe("near-upper");
  });

  it("has no bound to be near on an unbounded side", () => {
    expect(deriveRangeTone(rangeOf(null, null, "2000"))).toBe("in-range");
    expect(deriveRangeTone(rangeOf(null, "2050", "2000"))).toBe("near-upper");
  });

  it("falls back to a share of the range when the range is narrower than the price threshold", () => {
    // A ±1% band; a fixed 5% would cover it end to end and the warning could never switch off.
    const narrow = (current: string) => rangeOf("0.99005", "1.01005", current);
    expect(deriveRangeTone(narrow("1.0"))).toBe("in-range");
    expect(deriveRangeTone(narrow("0.9911"))).toBe("near-lower");
  });

  it("names the bound the reader is looking at, which swaps when the pair is inverted", () => {
    expect(deriveRangeTone(tight("0.923"))).toBe("near-lower");
    expect(deriveRangeTone(tight("0.923"), true)).toBe("near-upper");
  });
});

describe("derivePriceRangeVM", () => {
  it("centres the thumb on a range unbounded at both ends, which is what full range is", () => {
    const bar = derivePriceRangeVM(rangeOf(null, null, "2000"), tokens, false);
    expect(bar.thumbPct).toBeCloseTo(50, 6);
    expect(bar.inRange).toBe(true);
    expect(bar.minLabel).toBe("0");
    expect(bar.maxLabel).toBe("∞");
  });

  it("places the thumb by the price's position in the range, not by its arithmetic distance", () => {
    // 1,800–7,200 is two doublings; 3,600 is one of them, so it sits at the band's midpoint
    // even though it is a third of the way along in plain arithmetic.
    const bar = derivePriceRangeVM(rangeOf("1800", "7200", "3600"), tokens, false);
    expect(bar.thumbPct).toBeCloseTo(50, 6);
  });

  it("widens the band with the range, on a log scale", () => {
    const narrow = derivePriceRangeVM(rangeOf("1980", "2020", "2000"), tokens, false);
    const wide = derivePriceRangeVM(rangeOf("200", "20000", "2000"), tokens, false);
    expect(narrow.bandWidthPct).toBeLessThan(wide.bandWidthPct);
    expect(narrow.bandWidthPct).toBeGreaterThanOrEqual(20);
    expect(wide.bandWidthPct).toBeLessThanOrEqual(70);
  });

  it("pushes the thumb past the band, without pinning it to the edge, once the price leaves the range", () => {
    const justOut = derivePriceRangeVM(rangeOf("1800", "2200", "2300"), tokens, false);
    const farOut = derivePriceRangeVM(rangeOf("1800", "2200", "9000"), tokens, false);
    expect(justOut.inRange).toBe(false);
    expect(justOut.thumbPct).toBeGreaterThan(justOut.bandLeftPct + justOut.bandWidthPct);
    expect(farOut.thumbPct).toBeGreaterThan(justOut.thumbPct);
    expect(farOut.thumbPct).toBeLessThan(100);
  });

  it("mirrors the bar when the pair is inverted, and swaps which symbol prices which", () => {
    const plain = derivePriceRangeVM(rangeOf("1800", "2200", "1900"), tokens, false);
    const flipped = derivePriceRangeVM(rangeOf("1800", "2200", "1900"), tokens, true);
    expect(flipped.thumbPct).toBeCloseTo(100 - plain.thumbPct, 6);
    expect(plain.baseSymbol).toBe("WETH");
    expect(flipped.baseSymbol).toBe("USDC");
  });

  it("keeps a price of zero off the bar as a number rather than as NaN", () => {
    const bar = derivePriceRangeVM(rangeOf("1800", "2200", "0"), tokens, false);
    for (const value of [bar.bandLeftPct, bar.bandWidthPct, bar.thumbPct]) {
      expect(Number.isFinite(value)).toBe(true);
    }
    expect(bar.inRange).toBe(false);
  });
});
