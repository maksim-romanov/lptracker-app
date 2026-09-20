import { feeBlockPresentation } from "../fee-block-presentation";
import { describe, expect, it } from "bun:test";

describe("feeBlockPresentation", () => {
  it("says unknown when the read failed, whether or not amounts came with it", () => {
    expect(feeBlockPresentation({ feeMode: "unknown", hasAmounts: false })).toBe("unknown");
    expect(feeBlockPresentation({ feeMode: "unknown", hasAmounts: true })).toBe("unknown");
  });

  it("shows the amounts once the read succeeded and there is something to show", () => {
    expect(feeBlockPresentation({ feeMode: "claimable", hasAmounts: true })).toBe("amounts");
  });

  it("hides the block only when the read succeeded and the balance is nothing", () => {
    expect(feeBlockPresentation({ feeMode: "claimable", hasAmounts: false })).toBe("hidden");
  });

  it('treats a mode it was not compiled against as read, because only "unknown" means unread', () => {
    expect(feeBlockPresentation({ feeMode: "redirected", hasAmounts: false })).toBe("hidden");
    expect(feeBlockPresentation({ feeMode: "compounded", hasAmounts: true })).toBe("amounts");
    expect(feeBlockPresentation({ feeMode: "some-future-mode", hasAmounts: true })).toBe("amounts");
  });

  it("returns one of the three states for every input", () => {
    for (const input of [
      { feeMode: "unknown", hasAmounts: false },
      { feeMode: "unknown", hasAmounts: true },
      { feeMode: "claimable", hasAmounts: true },
      { feeMode: "claimable", hasAmounts: false },
    ]) {
      expect(["amounts", "unknown", "hidden"]).toContain(feeBlockPresentation(input));
    }
  });
});
