import { computeFeeGrowthInside, computeOwedBalance, type PositionOwedRawData, Q128, subInUint256 } from "../fee-math";
import { describe, expect, it } from "bun:test";

const WETH_DECIMALS = 18;
const USDC_DECIMALS = 6;

const TICK_LOWER = -600;
const TICK_UPPER = 600;
const IN_RANGE_TICK = 0;

// 0.004 WETH of fee accrual on 1e6 of liquidity, expressed as the growth-per-liquidity the
// pool actually stores: amount = liquidity * growthX128 / 2^128.
const LIQUIDITY = 1_000_000n;
const FEE_0 = 4_000_000_000_000_000n;
const FEE_1 = 12_500_000n;
const GROWTH_0_X128 = (FEE_0 * Q128) / LIQUIDITY;
const GROWTH_1_X128 = (FEE_1 * Q128) / LIQUIDITY;

// One and a half WETH, and the USDC beside it, credited to tokensOwed by decreaseLiquidity.
const WITHDRAWN_PRINCIPAL_0 = 1_500_000_000_000_000_000n;
const WITHDRAWN_PRINCIPAL_1 = 3_000_000_000n;

const raw = (overrides: Partial<PositionOwedRawData> = {}): PositionOwedRawData => ({
  feeGrowthGlobal0X128: GROWTH_0_X128,
  feeGrowthGlobal1X128: GROWTH_1_X128,
  feeGrowthOutside0LowerX128: 0n,
  feeGrowthOutside1LowerX128: 0n,
  feeGrowthOutside0UpperX128: 0n,
  feeGrowthOutside1UpperX128: 0n,
  feeGrowthInside0LastX128: 0n,
  feeGrowthInside1LastX128: 0n,
  tokensOwed0: 0n,
  tokensOwed1: 0n,
  onChainLiquidity: LIQUIDITY,
  ...overrides,
});

const owedFor = (overrides: Partial<PositionOwedRawData> = {}) =>
  computeOwedBalance(raw(overrides), IN_RANGE_TICK, TICK_LOWER, TICK_UPPER, WETH_DECIMALS, USDC_DECIMALS);

describe("computeOwedBalance", () => {
  it("is pure fee accrual for a position that has never withdrawn, since tokensOwed is empty", () => {
    const owed = owedFor();

    expect(owed.token0Raw).toBe(FEE_0.toString());
    expect(owed.token1Raw).toBe(FEE_1.toString());
  });

  it("carries withdrawn principal alongside the fees on a drained position, which is the whole claim", () => {
    // liquidity 0: the growth term is zero, so everything here came out of tokensOwed — and
    // 1.5 WETH of it is the owner's own principal, not a thing the position earned.
    const owed = owedFor({
      onChainLiquidity: 0n,
      tokensOwed0: WITHDRAWN_PRINCIPAL_0 + FEE_0,
      tokensOwed1: WITHDRAWN_PRINCIPAL_1 + FEE_1,
    });

    expect(owed.token0Raw).toBe("1504000000000000000");
    expect(owed.token1Raw).toBe("3012500000");
    expect(owed.token0).toBeCloseTo(1.504, 12);
  });

  it("carries withdrawn principal on a live position too, so this is not a drained-only case", () => {
    // A partial decreaseLiquidity leaves liquidity above zero and principal in tokensOwed at
    // the same time. The result is the sum of the two, with nothing on it saying which is which.
    const owed = owedFor({ tokensOwed0: WITHDRAWN_PRINCIPAL_0, tokensOwed1: WITHDRAWN_PRINCIPAL_1 });

    expect(owed.token0Raw).toBe((WITHDRAWN_PRINCIPAL_0 + FEE_0).toString());
    expect(owed.token1Raw).toBe((WITHDRAWN_PRINCIPAL_1 + FEE_1).toString());
  });

  it("counts only the growth accrued since the last checkpoint, not the growth since the position opened", () => {
    const owed = owedFor({ feeGrowthInside0LastX128: GROWTH_0_X128, feeGrowthInside1LastX128: GROWTH_1_X128 });

    expect(owed.token0Raw).toBe("0");
    expect(owed.token1Raw).toBe("0");
  });

  it("reports nothing owed when both the checkpoint and tokensOwed are empty", () => {
    const owed = owedFor({ feeGrowthGlobal0X128: 0n, feeGrowthGlobal1X128: 0n });

    expect(owed.token0Raw).toBe("0");
    expect(owed.token1Raw).toBe("0");
  });

  it("leaves no fee accrual on a position sitting outside its own range", () => {
    const belowRange = computeOwedBalance(raw(), TICK_LOWER - 1, TICK_LOWER, TICK_UPPER, WETH_DECIMALS, USDC_DECIMALS);

    expect(belowRange.token0Raw).toBe("0");
  });
});

describe("computeFeeGrowthInside", () => {
  it("takes the difference of the two outsides below the range", () => {
    expect(computeFeeGrowthInside(TICK_LOWER - 1, TICK_LOWER, TICK_UPPER, 100n, 70n, 20n)).toBe(50n);
  });

  it("takes the difference the other way round at or above the upper tick", () => {
    expect(computeFeeGrowthInside(TICK_UPPER, TICK_LOWER, TICK_UPPER, 100n, 20n, 70n)).toBe(50n);
  });

  it("takes global minus both outsides inside the range", () => {
    expect(computeFeeGrowthInside(IN_RANGE_TICK, TICK_LOWER, TICK_UPPER, 100n, 20n, 30n)).toBe(50n);
  });
});

describe("subInUint256", () => {
  // Fee growth counters are uint256 that wrap by design, and the difference is meant to wrap
  // with them. Plain bigint subtraction would go negative and take the owed figure with it.
  it("wraps rather than going negative, the way the pool's own counters do", () => {
    expect(subInUint256(10n, 20n)).toBe(2n ** 256n - 10n);
  });

  it("is ordinary subtraction when it does not have to wrap", () => {
    expect(subInUint256(20n, 10n)).toBe(10n);
  });
});
