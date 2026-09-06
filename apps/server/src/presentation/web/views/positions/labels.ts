import type { TUniswapV3RangeStatus } from "@depthly/protocol-math/uniswap-v3";

import type { ICardVM, TPositionRangeTone } from "#features/uniswap-v3/presentation/web/position.web-mapper";

const STATUS: Record<TUniswapV3RangeStatus, string> = {
  "in-range": "In range",
  "out-of-range": "Out of range",
  closed: "Closed",
};

export const statusLabel = (status: TUniswapV3RangeStatus): string => STATUS[status];

const RANGE_TONE: Record<TPositionRangeTone, string> = {
  "in-range": "In range",
  "near-lower": "Near lower bound",
  "near-upper": "Near upper bound",
  "out-of-range": "Out of range",
  closed: "Closed",
};

export const rangeToneLabel = (tone: TPositionRangeTone): string => RANGE_TONE[tone];

export const pairLabel = (pair: ICardVM["pair"]): string => `${pair.base.symbol} / ${pair.quote.symbol}`;

export const shortenAddress = (address: string): string => (address.length > 12 ? `${address.slice(0, 6)}\u2026${address.slice(-4)}` : address);

// Colons are legal in a DOM id but break CSS/JS selectors that look one up, so they become dashes.
export const itemDomId = (ref: string): string => `position-${ref.replace(/:/g, "-")}`;
