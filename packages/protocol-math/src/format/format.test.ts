import { formatPrice, formatTokenAmount } from "./format";
import { describe, expect, it } from "bun:test";

describe("formatPrice", () => {
  it("formats large numbers with thousand separators and 2 decimals", () => {
    expect(formatPrice(3100)).toBe("3,100.00");
    expect(formatPrice(2700.456)).toBe("2,700.46");
  });

  it("formats mid-range numbers with 4 decimals", () => {
    expect(formatPrice(1.5)).toBe("1.5000");
    expect(formatPrice(42.1234567)).toBe("42.1235");
  });

  it("formats small numbers with 6 decimals", () => {
    expect(formatPrice(0.001234)).toBe("0.001234");
  });

  it("formats very small numbers with 8 decimals", () => {
    expect(formatPrice(0.00000387)).toBe("0.00000387");
  });

  it("uses exponential for very small numbers", () => {
    expect(formatPrice(1e-9)).toBe("1.00e-9");
  });

  it("collapses to 0 for prices below the practical minimum", () => {
    expect(formatPrice(1e-16)).toBe("0");
    expect(formatPrice(3.4e-39)).toBe("0");
  });

  it("collapses to ∞ for prices above the practical maximum (V3 full-range)", () => {
    expect(formatPrice(3.4e38)).toBe("∞");
    expect(formatPrice(1e15)).toBe("∞");
  });

  it("uses compact (K/M/B/T) for huge but finite prices", () => {
    expect(formatPrice(1_500_000)).toBe("1.5M");
    expect(formatPrice(12_345_678)).toBe("12.35M");
    expect(formatPrice(340_256_786_833_063)).toBe("340.26T");
  });

  it("returns em-dash for non-finite or non-positive input", () => {
    expect(formatPrice(0)).toBe("—");
    expect(formatPrice(-1)).toBe("—");
    expect(formatPrice(Number.NaN)).toBe("—");
    expect(formatPrice(Number.POSITIVE_INFINITY)).toBe("—");
  });
});

describe("formatTokenAmount", () => {
  it("uses 6 decimals by default and trims trailing zeros", () => {
    expect(formatTokenAmount("1.0")).toBe("1");
    expect(formatTokenAmount("1000")).toBe("1,000");
    expect(formatTokenAmount("34.1231345")).toBe("34.123135");
    expect(formatTokenAmount("0.01")).toBe("0.01");
  });

  it("honors server-emitted displayDecimals for stablecoins", () => {
    expect(formatTokenAmount("1234.567890", 2)).toBe("1,234.57");
    expect(formatTokenAmount("1000.0", 2)).toBe("1,000");
    expect(formatTokenAmount("0.015", 2)).toBe("0.02");
  });

  it("returns '< threshold' for amounts below precision", () => {
    expect(formatTokenAmount("0.0000001")).toBe("< 0.000001");
    expect(formatTokenAmount("0.001", 2)).toBe("< 0.01");
  });

  it("returns '0' for zero / non-finite input", () => {
    expect(formatTokenAmount("0")).toBe("0");
    expect(formatTokenAmount("not-a-number")).toBe("0");
  });

  it("uses compact (K/M/B/T) for amounts above 1M to fit the card", () => {
    expect(formatTokenAmount("1500000")).toBe("1.5M");
    expect(formatTokenAmount("499876954.71")).toBe("499.88M");
    expect(formatTokenAmount("500000000")).toBe("500M");
    expect(formatTokenAmount("12345678901")).toBe("12.35B");
  });
});
