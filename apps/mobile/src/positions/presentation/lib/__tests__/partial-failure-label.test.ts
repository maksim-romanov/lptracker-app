import { partialFailureLabel } from "../partial-failure-label";
import { describe, expect, it } from "bun:test";

describe("partialFailureLabel", () => {
  it("returns null when no source failed", () => {
    expect(partialFailureLabel([])).toBeNull();
  });

  it("names a single failed source in the singular", () => {
    const failures = [{ protocol: "uniswap-v3", chainId: 1, message: "source down" }];
    expect(partialFailureLabel(failures)).toBe("1 source could not be checked");
  });

  it("names multiple failed sources in the plural", () => {
    const failures = [
      { protocol: "uniswap-v3", chainId: 1, message: "source down" },
      { protocol: "aerodrome", chainId: 8453, message: "timeout" },
    ];
    expect(partialFailureLabel(failures)).toBe("2 sources could not be checked");
  });
});
