export const Q128 = 2n ** 128n;
export const Q256 = 2n ** 256n;

export const subInUint256 = (a: bigint, b: bigint) => (((a - b) % Q256) + Q256) % Q256;

export const computeFeeGrowthInside = (
  currentTick: number,
  tickLower: number,
  tickUpper: number,
  feeGrowthGlobalX128: bigint,
  feeGrowthOutsideLowerX128: bigint,
  feeGrowthOutsideUpperX128: bigint,
): bigint => {
  if (currentTick < tickLower) return subInUint256(feeGrowthOutsideLowerX128, feeGrowthOutsideUpperX128);
  if (currentTick >= tickUpper) return subInUint256(feeGrowthOutsideUpperX128, feeGrowthOutsideLowerX128);

  return subInUint256(feeGrowthGlobalX128, feeGrowthOutsideLowerX128 + feeGrowthOutsideUpperX128);
};

export interface PositionOwedRawData {
  feeGrowthGlobal0X128: bigint;
  feeGrowthGlobal1X128: bigint;
  feeGrowthOutside0LowerX128: bigint;
  feeGrowthOutside1LowerX128: bigint;
  feeGrowthOutside0UpperX128: bigint;
  feeGrowthOutside1UpperX128: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
  onChainLiquidity: bigint;
}

export interface ComputedOwedBalance {
  token0: number;
  token1: number;
  /** Raw owed amount for token0 as a base-10 integer string (BigInt-safe for cache serialization) */
  token0Raw: string;
  /** Raw owed amount for token1 as a base-10 integer string */
  token1Raw: string;
}

/**
 * What `collect()` would pay out now — not a fee figure.
 *
 * `tokensOwed` is one uint128 per token with no sub-ledger. `decreaseLiquidity` credits the
 * withdrawn principal into it, so it holds principal and fees mixed together; v3-core states
 * this outright on `IUniswapV3PoolActions.collect`: "Tokens owed may be from accumulated swap
 * fees or burned liquidity." Splitting the two needs the position's `DecreaseLiquidity`
 * history, which this read does not have.
 *
 * The growth term added here is unambiguously fee — it is the uncheckpointed accrual on the
 * position's own liquidity — but it is only the part accrued since the last touch, so it is
 * not a position's fee income either.
 */
export function computeOwedBalance(
  raw: PositionOwedRawData,
  currentTick: number,
  tickLower: number,
  tickUpper: number,
  decimals0: number,
  decimals1: number,
): ComputedOwedBalance {
  const feeGrowthInside0X128 = computeFeeGrowthInside(
    currentTick,
    tickLower,
    tickUpper,
    raw.feeGrowthGlobal0X128,
    raw.feeGrowthOutside0LowerX128,
    raw.feeGrowthOutside0UpperX128,
  );

  const feeGrowthInside1X128 = computeFeeGrowthInside(
    currentTick,
    tickLower,
    tickUpper,
    raw.feeGrowthGlobal1X128,
    raw.feeGrowthOutside1LowerX128,
    raw.feeGrowthOutside1UpperX128,
  );

  const feeGrowthInside0DeltaX128 = subInUint256(feeGrowthInside0X128, raw.feeGrowthInside0LastX128);
  const feeGrowthInside1DeltaX128 = subInUint256(feeGrowthInside1X128, raw.feeGrowthInside1LastX128);

  const owed0 = raw.tokensOwed0 + (raw.onChainLiquidity * feeGrowthInside0DeltaX128) / Q128;
  const owed1 = raw.tokensOwed1 + (raw.onChainLiquidity * feeGrowthInside1DeltaX128) / Q128;

  return {
    token0: Number(owed0) / 10 ** decimals0,
    token1: Number(owed1) / 10 ** decimals1,
    token0Raw: owed0.toString(),
    token1Raw: owed1.toString(),
  };
}
