import { deriveStatus } from "./status";
import { describe, expect, it } from "bun:test";

describe("deriveStatus", () => {
  it("maps known server states", () => {
    expect(deriveStatus("in-range")).toBe("in-range");
    expect(deriveStatus("out-of-range")).toBe("out-of-range");
    expect(deriveStatus("closed")).toBe("closed");
  });

  it("treats 'open' as in-range", () => {
    expect(deriveStatus("open")).toBe("in-range");
  });

  it("falls back to in-range for unknown states", () => {
    expect(deriveStatus("whatever")).toBe("in-range");
  });
});
