import { FEE_ACCRUAL_MODES } from "@depthly/catalog";

export type TFeeBlockPresentation = "amounts" | "unknown" | "hidden";

// A read that failed and a balance of zero are the same empty list on the wire, and only the
// second may hide the block: hiding the first reports money nobody counted as none.
export function feeBlockPresentation({ feeMode, hasAmounts }: { feeMode: string; hasAmounts: boolean }): TFeeBlockPresentation {
  if (feeMode === FEE_ACCRUAL_MODES.unknown) return "unknown";
  return hasAmounts ? "amounts" : "hidden";
}
