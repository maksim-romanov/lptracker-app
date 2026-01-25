import { Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";
import { err, ok } from "neverthrow";
import { inject, injectable } from "tsyringe";

import type { ChainContext } from "../data/clients/chain-context";
import { PositionsRepository } from "../data/positions.repository";
import { CHAIN_CONTEXT } from "../di/tokens";

@injectable()
export class GetPositionFeesUseCase {
  constructor(
    @inject(CHAIN_CONTEXT) public readonly chainContext: ChainContext,
    @inject(PositionsRepository) public readonly positionsRepository: PositionsRepository,
  ) {}

  async execute(id: string) {
    const position = await this.positionsRepository.getPosition(id);
    if (position.isErr()) return err(position.error);

    const positionFees = await this.positionsRepository.getPositionFees(position.value.toDomain());
    if (position.isErr()) return err(position.error);

    const feeGrowthInside0X128 = computeFeeGrowthInside(
      position.value.pool.currentTick,
      position.value.tickLower,
      position.value.tickUpper,
      positionFees.value.feeGrowthGlobal0X128,
      positionFees.value.feeGrowthOutside0LowerX128,
      positionFees.value.feeGrowthOutside0UpperX128,
    );

    const feeGrowthInside1X128 = computeFeeGrowthInside(
      position.value.pool.currentTick,
      position.value.tickLower,
      position.value.tickUpper,
      positionFees.value.feeGrowthGlobal1X128,
      positionFees.value.feeGrowthOutside1LowerX128,
      positionFees.value.feeGrowthOutside1UpperX128,
    );

    const feeGrowthInside0DeltaX128 = subInUint256(feeGrowthInside0X128, positionFees.value.feeGrowthInside0LastX128);
    const feeGrowthInside1DeltaX128 = subInUint256(feeGrowthInside1X128, positionFees.value.feeGrowthInside1LastX128);

    const unclaimedFees0 = positionFees.value.tokensOwed0 + (positionFees.value.onChainLiquidity * feeGrowthInside0DeltaX128) / Q128;
    const unclaimedFees1 = positionFees.value.tokensOwed1 + (positionFees.value.onChainLiquidity * feeGrowthInside1DeltaX128) / Q128;

    // Format fees
    const fees0Formatted = Number(unclaimedFees0) / 10 ** position.value.pool.token0.decimals;
    const fees1Formatted = Number(unclaimedFees1) / 10 ** position.value.pool.token1.decimals;

    const token0 = new Token(
      this.chainContext.chain.id,
      position.value.pool.token0.id,
      position.value.pool.token0.decimals,
      position.value.pool.token0.symbol,
    );

    const token1 = new Token(
      this.chainContext.chain.id,
      position.value.pool.token1.id,
      position.value.pool.token1.decimals,
      position.value.pool.token1.symbol,
    );

    const pool = new Pool(
      token0,
      token1,
      position.value.pool.feeTier,
      position.value.pool.sqrtPriceX96.toString(),
      position.value.liquidity.toString(),
      position.value.pool.currentTick,
    );

    // Current prices
    const currentPriceT1PerT0 = pool.token0Price; // price of token0 in terms of token1
    const currentPriceT0PerT1 = pool.token1Price; // price of token1 in terms of token0

    // Total fees in terms of each token
    const totalInToken0 = fees0Formatted + fees1Formatted * Number(currentPriceT0PerT1.toSignificant(token0.decimals));
    const totalInToken1 = fees1Formatted + fees0Formatted * Number(currentPriceT1PerT0.toSignificant(token1.decimals));

    return ok({
      token0: { address: token0.address, symbol: token0.symbol, decimals: token0.decimals },
      token1: { address: token1.address, symbol: token1.symbol, decimals: token1.decimals },

      unclaimedFees: {
        token0PerToken1: {
          label: `${token0.symbol}/${token1.symbol}`,
          token0: fees0Formatted,
          token1: fees1Formatted,
          total: totalInToken0,
        },

        token1PerToken0: {
          label: `${token1.symbol}/${token0.symbol}`,
          token0: fees0Formatted,
          token1: fees1Formatted,
          total: totalInToken1,
        },
      },
    });
  }
}

export const Q128 = 2n ** 128n;
export const Q256 = 2n ** 256n;

const subInUint256 = (a: bigint, b: bigint) => (((a - b) % Q256) + Q256) % Q256;

const computeFeeGrowthInside = (
  currentTick: number,
  tickLower: number,
  tickUpper: number,
  feeGrowthGlobalX128: bigint,
  feeGrowthOutsideLowerX128: bigint,
  feeGrowthOutsideUpperX128: bigint,
) => {
  if (currentTick < tickLower) return subInUint256(feeGrowthOutsideLowerX128, feeGrowthOutsideUpperX128);
  if (currentTick >= tickUpper) return subInUint256(feeGrowthOutsideUpperX128, feeGrowthOutsideLowerX128);

  return subInUint256(feeGrowthGlobalX128, feeGrowthOutsideLowerX128 + feeGrowthOutsideUpperX128);
};
