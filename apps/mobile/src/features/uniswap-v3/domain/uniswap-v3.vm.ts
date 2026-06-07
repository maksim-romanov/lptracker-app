export type TUniswapV3RangeStatus = "in-range" | "out-of-range" | "closed";

export interface TUniswapV3TokenSide {
  readonly tokenRef: string;
  readonly symbol: string;
  readonly formatted: string;
}

export interface TUniswapV3PriceRange {
  readonly minLabel: string;
  readonly currentLabel: string;
  readonly maxLabel: string;
  readonly quoteSymbol: string;
  readonly baseSymbol: string;
}

export interface TUniswapV3VM {
  readonly nftTokenId: string;
  readonly feeTierLabel: string;
  readonly status: TUniswapV3RangeStatus;
  readonly principal: ReadonlyArray<TUniswapV3TokenSide>;
  readonly fees: ReadonlyArray<TUniswapV3TokenSide>;
  readonly priceRange: TUniswapV3PriceRange;
  readonly poolAddress: string;
}
