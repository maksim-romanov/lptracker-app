import { formatWidgetAmount } from "../format";
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
