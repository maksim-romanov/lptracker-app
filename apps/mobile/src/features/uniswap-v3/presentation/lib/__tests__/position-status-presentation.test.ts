import { positionStatusPresentation } from "../position-status-presentation";
import { describe, expect, it } from "bun:test";

describe("positionStatusPresentation", () => {
  it("tells a drained position to act rather than announcing an ending", () => {
    expect(positionStatusPresentation("drained")).toEqual({ tone: "brand", label: "To claim" });
  });

  it("keeps a closed position ended and untinted", () => {
    expect(positionStatusPresentation("closed")).toEqual({ tone: "neutral", label: "Closed" });
  });

  it("does not spend the near-a-bound tone on a drained position", () => {
    expect(positionStatusPresentation("out-of-range").tone).toBe("warning");
    expect(positionStatusPresentation("drained").tone).not.toBe(positionStatusPresentation("out-of-range").tone);
  });

  it("marks a live position as earning", () => {
    expect(positionStatusPresentation("in-range")).toEqual({ tone: "success", label: "In range" });
  });

  it("shows an unrecognized state as unknown and never as a live position", () => {
    const unknown = positionStatusPresentation("unknown");
    expect(unknown.label).toBe("Unknown state");
    expect(unknown).not.toEqual(positionStatusPresentation("in-range"));
    expect(unknown.tone).not.toBe("success");
  });

  it("gives every state a label of its own, so no two states read as the same one", () => {
    const labels = (["in-range", "out-of-range", "drained", "closed", "unknown"] as const).map(
      (status) => positionStatusPresentation(status).label,
    );
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels.filter((label) => label.trim() === "")).toEqual([]);
  });
});
