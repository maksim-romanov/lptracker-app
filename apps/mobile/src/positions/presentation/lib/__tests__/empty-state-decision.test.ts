import { emptyStateDecision } from "../empty-state-decision";
import { describe, expect, it } from "bun:test";

describe("emptyStateDecision", () => {
  it("shows the empty state alone when nothing loaded and every source answered", () => {
    expect(emptyStateDecision({ itemCount: 0, hasClientSideSelection: true, failureCount: 0 })).toBe("empty");
  });

  it("withholds the empty state when a failed source makes the emptiness unknown", () => {
    expect(emptyStateDecision({ itemCount: 0, hasClientSideSelection: true, failureCount: 1 })).toBe("banner-only");
  });

  it("keeps the empty state when it describes an empty selection a failed source cannot falsify", () => {
    expect(emptyStateDecision({ itemCount: 0, hasClientSideSelection: false, failureCount: 1 })).toBe("banner-and-empty");
  });

  it("still describes the empty selection when no source failed", () => {
    expect(emptyStateDecision({ itemCount: 0, hasClientSideSelection: false, failureCount: 0 })).toBe("empty");
  });

  it("shows no empty state once there is something to list", () => {
    expect(emptyStateDecision({ itemCount: 2, hasClientSideSelection: true, failureCount: 1 })).toBe("banner-only");
    expect(emptyStateDecision({ itemCount: 2, hasClientSideSelection: false, failureCount: 0 })).toBe("banner-only");
  });
});
