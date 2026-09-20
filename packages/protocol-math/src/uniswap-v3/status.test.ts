import { deriveStatus } from "./status";
import { describe, expect, it } from "bun:test";

describe("deriveStatus", () => {
  it("maps known server states", () => {
    expect(deriveStatus("in-range")).toBe("in-range");
    expect(deriveStatus("out-of-range")).toBe("out-of-range");
    expect(deriveStatus("closed")).toBe("closed");
  });

  it("keeps a drained position distinct from a closed one", () => {
    expect(deriveStatus("drained")).toBe("drained");
  });

  it("names an unrecognized state unknown instead of rendering it as live", () => {
    expect(deriveStatus("whatever")).toBe("unknown");
    expect(deriveStatus("whatever")).not.toBe("in-range");
  });

  it("does not throw on an unrecognized state, which would take down the screen", () => {
    expect(() => deriveStatus("whatever")).not.toThrow();
  });

  it("stops reading the list filter's vocabulary as a state", () => {
    expect(deriveStatus("open")).toBe("unknown");
  });
});
