import { formatWidgetAmount, formatWidgetBoundLabel, formatWidgetPrice } from "../format";
import { describe, expect, it } from "bun:test";

describe("formatWidgetAmount", () => {
  it("preserves 0 and tiny values", () => {
    expect(formatWidgetAmount("0")).toBe("0");
    expect(formatWidgetAmount("0.000001")).toBe("<0.0001");
  });

  it("uses up to 4 decimals below 1", () => {
    expect(formatWidgetAmount("0.012345")).toBe("0.0123");
    expect(formatWidgetAmount("0.1")).toBe("0.1");
  });

  it("uses up to 2 decimals between 1 and 1000", () => {
    expect(formatWidgetAmount("1.00")).toBe("1");
    expect(formatWidgetAmount("12.345")).toBe("12.35");
    expect(formatWidgetAmount("999")).toBe("999");
  });

  it("compacts thousands", () => {
    expect(formatWidgetAmount("1000")).toBe("1K");
    expect(formatWidgetAmount("1500")).toBe("1.5K");
    expect(formatWidgetAmount("12345")).toBe("12.35K");
  });

  it("compacts millions and billions", () => {
    expect(formatWidgetAmount("1234567")).toBe("1.23M");
    expect(formatWidgetAmount("2500000000")).toBe("2.5B");
  });

  it("preserves negatives", () => {
    expect(formatWidgetAmount("-1500")).toBe("-1.5K");
  });

  it("returns raw on non-numeric input", () => {
    expect(formatWidgetAmount("not a number")).toBe("not a number");
  });
});

describe("formatWidgetPrice", () => {
  it("drops decimals above 1000 and keeps no grouping separator", () => {
    expect(formatWidgetPrice("2000")).toBe("2000");
    expect(formatWidgetPrice("1600.4")).toBe("1600");
  });

  it("widens the mantissa as the price shrinks", () => {
    expect(formatWidgetPrice("2.5")).toBe("2.5");
    expect(formatWidgetPrice("0.25")).toBe("0.25");
    expect(formatWidgetPrice("0.000625")).toBe("0.000625");
    expect(formatWidgetPrice("0.00000012")).toBe("1.20e-7");
  });

  it("compacts the magnitudes a bar label cannot hold", () => {
    expect(formatWidgetPrice("2500000")).toBe("2.5M");
    expect(formatWidgetPrice("3200000000")).toBe("3.2B");
    expect(formatWidgetPrice("4100000000000")).toBe("4.1T");
  });

  it("collapses prices past the ends of the ladder", () => {
    expect(formatWidgetPrice("0")).toBe("0");
    expect(formatWidgetPrice("1e20")).toBe("∞");
  });

  it("does not let a price that failed to parse borrow an unbounded glyph", () => {
    expect(formatWidgetPrice("not-a-number")).toBe("—");
    expect(formatWidgetPrice("not-a-number")).not.toBe(formatWidgetBoundLabel(null, "high"));
    expect(formatWidgetPrice("not-a-number")).not.toBe(formatWidgetBoundLabel(null, "low"));
  });
});

describe("formatWidgetBoundLabel", () => {
  it("renders an unbounded bound as the end of the axis it sits on", () => {
    expect(formatWidgetBoundLabel(null, "low")).toBe("0");
    expect(formatWidgetBoundLabel(null, "high")).toBe("∞");
  });

  it("formats a bound that has a price", () => {
    expect(formatWidgetBoundLabel("2500", "high")).toBe("2500");
  });
});
