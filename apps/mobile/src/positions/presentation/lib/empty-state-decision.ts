export type TEmptyStateDecision = "empty" | "banner-only" | "banner-and-empty";

interface IEmptyStateInput {
  /** Items the screen is about to list. */
  readonly itemCount: number;
  /** Whether the user has picked anything for this screen to show — wallets, followed refs. */
  readonly hasClientSideSelection: boolean;
  /** Sources that could not be checked on this fetch. */
  readonly failureCount: number;
}

/**
 * An empty state that asserts the wallets hold nothing is falsified by a failed source, so it
 * gives way to the banner. An empty state that asserts the user has selected nothing is not:
 * it describes client state the fetch never touched, and suppressing it leaves a blank screen.
 */
export function emptyStateDecision({ itemCount, hasClientSideSelection, failureCount }: IEmptyStateInput): TEmptyStateDecision {
  if (itemCount > 0) return "banner-only";
  if (failureCount === 0) return "empty";
  return hasClientSideSelection ? "banner-only" : "banner-and-empty";
}
