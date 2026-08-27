import type { TUniswapV3RangeStatus } from "@depthly/protocol-math/uniswap-v3";

import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

const STATUS: Record<TUniswapV3RangeStatus, string> = {
  "in-range": "In range",
  "out-of-range": "Out of range",
  closed: "Closed",
};

export const statusLabel = (status: TUniswapV3RangeStatus): string => STATUS[status];

// How a pool pair reads, in one place: it is rendered as the item's heading and reused
// verbatim inside the "View … details" accessible name, so the two cannot drift.
export const pairLabel = (pair: ICardVM["pair"]): string => `${pair.base.symbol} / ${pair.quote.symbol}`;
