export interface TTickPriceRangeInput {
  readonly tickLower: number;
  readonly tickUpper: number;
  readonly currentTick: number;
  readonly baseDecimals: number;
  readonly quoteDecimals: number;
  readonly inverted: boolean;
}

export interface TPriceRange {
  readonly min: number;
  readonly current: number;
  readonly max: number;
}

export function tickToPrice(tick: number, baseDecimals: number, quoteDecimals: number): number {
  return Math.exp(tick * Math.log(1.0001) + (baseDecimals - quoteDecimals) * Math.log(10));
}

export function priceRangeFromTicks(input: TTickPriceRangeInput): TPriceRange {
  const lowerPrice = tickToPrice(input.tickLower, input.baseDecimals, input.quoteDecimals);
  const currentPrice = tickToPrice(input.currentTick, input.baseDecimals, input.quoteDecimals);
  const upperPrice = tickToPrice(input.tickUpper, input.baseDecimals, input.quoteDecimals);

  return {
    min: input.inverted ? 1 / upperPrice : lowerPrice,
    current: input.inverted ? 1 / currentPrice : currentPrice,
    max: input.inverted ? 1 / lowerPrice : upperPrice,
  };
}
