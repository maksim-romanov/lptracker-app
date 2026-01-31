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

export interface PositionFeeRawData {
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

export interface ComputedFees {
  token0: number;
  token1: number;
}

export function computeUnclaimedFees(
  raw: PositionFeeRawData,
  currentTick: number,
  tickLower: number,
  tickUpper: number,
  decimals0: number,
  decimals1: number,
): ComputedFees {
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

  const unclaimedFees0 = raw.tokensOwed0 + (raw.onChainLiquidity * feeGrowthInside0DeltaX128) / Q128;
  const unclaimedFees1 = raw.tokensOwed1 + (raw.onChainLiquidity * feeGrowthInside1DeltaX128) / Q128;

  return {
    token0: Number(unclaimedFees0) / 10 ** decimals0,
    token1: Number(unclaimedFees1) / 10 ** decimals1,
  };
}
