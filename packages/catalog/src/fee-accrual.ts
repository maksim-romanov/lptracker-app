// The modes the position contract names for `feeAccrual.mode`. The wire value stays an open
// string — a protocol may ship a mode no client was compiled against — so these are the ones a
// client can reason about, not the ones it may receive.
export const FEE_ACCRUAL_MODES = {
  /** The fee amount could not be read. Not a balance of zero, and not a statement about where the fees went. */
  unknown: "unknown",
  /** The owner can collect the listed owed tokens. The only mode that may list one. */
  claimable: "claimable",
  /** The fees accrue to someone else, a gauge's voters for instance. */
  redirected: "redirected",
  /** The fees are already counted inside principal, having been reinvested. */
  compounded: "compounded",
} as const;
