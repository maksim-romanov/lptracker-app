import type { TUniswapV3RangeStatus } from "@depthly/protocol-math/uniswap-v3";

export type { TUniswapV3RangeStatus };

export interface TUniswapV3TokenSide {
  readonly tokenRef: string;
  readonly symbol: string;
  readonly formatted: string;
  readonly iconUrl: string;
}

export interface TUniswapV3PriceRange {
  readonly minLabel: string;
  readonly currentLabel: string;
  readonly maxLabel: string;
  readonly quoteSymbol: string;
  readonly baseSymbol: string;
}

export interface TUniswapV3PairSide {
  readonly tokenRef: string;
  readonly symbol: string;
  readonly iconUrl: string;
}

export interface TUniswapV3Pair {
  readonly base: TUniswapV3PairSide;
  readonly quote: TUniswapV3PairSide;
}

export interface TUniswapV3VM {
  readonly nftTokenId: string;
  readonly feeTierLabel: string;
  readonly status: TUniswapV3RangeStatus;
  readonly pair: TUniswapV3Pair;
  readonly principal: ReadonlyArray<TUniswapV3TokenSide>;
  // What a claim transaction would pay out, which includes withdrawn principal — not fee income.
  readonly owed: ReadonlyArray<TUniswapV3TokenSide>;
  readonly priceRange: TUniswapV3PriceRange;
  readonly poolAddress: string;
  // Whether the owed side holds more than dust. Read off the wire amounts: a dust balance
  // formats as "< 0.000001", which is not a number the display strings can be compared on.
  readonly hasUnclaimedBalance: boolean;
  // The contract's `feeAccrual.mode` verbatim, so a redirected balance stays distinguishable
  // from a compounded one. A position whose read failed carries no owed token, so hiding the
  // block on an empty list would report an unread amount as nothing owed.
  readonly feeMode: string;
}
