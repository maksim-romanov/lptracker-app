/**
 * P&L glyphs — direction marks for value deltas.
 *
 * Color tokens live on the theme as `success` (gain) and `error` (loss) and
 * adapt per light/dark variant. Glyphs are static.
 */

export const pnl = {
  glyph: {
    gain: "▲",
    loss: "▼",
    flat: "—",
  },
} as const;

export type PnLTokens = typeof pnl;

export type PnLDirection = "gain" | "loss" | "flat";

/** Classify a numeric delta into a P&L direction. */
export const directionOf = (delta: number, epsilon = 0.0001): PnLDirection => {
  if (delta > epsilon) return "gain";
  if (delta < -epsilon) return "loss";
  return "flat";
};
