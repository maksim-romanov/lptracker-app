import type { TUniswapV3RangeStatus } from "@depthly/protocol-math/uniswap-v3";

import type { ICardVM, TPositionRangeTone } from "#features/uniswap-v3/presentation/web/position.web-mapper";

const STATUS: Record<TUniswapV3RangeStatus, string> = {
  "in-range": "In range",
  "out-of-range": "Out of range",
  closed: "Closed",
};

export const statusLabel = (status: TUniswapV3RangeStatus): string => STATUS[status];

// The two near-edge tones name the bound the price is approaching, because that is what
// decides which way a position has to be rebalanced.
const RANGE_TONE: Record<TPositionRangeTone, string> = {
  "in-range": "In range",
  "near-lower": "Near lower bound",
  "near-upper": "Near upper bound",
  "out-of-range": "Out of range",
  closed: "Closed",
};

export const rangeToneLabel = (tone: TPositionRangeTone): string => RANGE_TONE[tone];

// How a pool pair reads, in one place: it is rendered as the item's heading and reused
// verbatim inside the "View … details" accessible name, so the two cannot drift.
export const pairLabel = (pair: ICardVM["pair"]): string => `${pair.base.symbol} / ${pair.quote.symbol}`;
