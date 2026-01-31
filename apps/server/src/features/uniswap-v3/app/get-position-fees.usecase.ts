import { err, ok } from "neverthrow";
import { inject, injectable } from "tsyringe";

import type { TokenPriceService } from "token-prices/domain/token-price-service";
import { cacheKey } from "token-prices/domain/types";
import { TOKEN_PRICE_SERVICE } from "token-prices/di/tokens";
import { PositionsRepository } from "../data/positions.repository";

@injectable()
export class GetPositionFeesUseCase {
  constructor(
    @inject(PositionsRepository) public readonly positionsRepository: PositionsRepository,
    @inject(TOKEN_PRICE_SERVICE) private readonly priceService: TokenPriceService,
  ) {}

  async execute(id: string) {
    const position = await this.positionsRepository.getPosition(id);
    if (position.isErr()) return err(position.error);

    const entity = position.value.toDomain();
    const positionFees = await this.positionsRepository.getPositionFees(entity);
    if (positionFees.isErr()) return err(positionFees.error);

    const { token0, token1 } = entity.pool;

    const feeGrowthInside0X128 = computeFeeGrowthInside(
      entity.pool.currentTick,
      entity.tickLower,
      entity.tickUpper,
      positionFees.value.feeGrowthGlobal0X128,
      positionFees.value.feeGrowthOutside0LowerX128,
      positionFees.value.feeGrowthOutside0UpperX128,
    );

    const feeGrowthInside1X128 = computeFeeGrowthInside(
      entity.pool.currentTick,
      entity.tickLower,
      entity.tickUpper,
      positionFees.value.feeGrowthGlobal1X128,
      positionFees.value.feeGrowthOutside1LowerX128,
      positionFees.value.feeGrowthOutside1UpperX128,
    );

    const feeGrowthInside0DeltaX128 = subInUint256(feeGrowthInside0X128, positionFees.value.feeGrowthInside0LastX128);
    const feeGrowthInside1DeltaX128 = subInUint256(feeGrowthInside1X128, positionFees.value.feeGrowthInside1LastX128);

    const unclaimedFees0 = positionFees.value.tokensOwed0 + (positionFees.value.onChainLiquidity * feeGrowthInside0DeltaX128) / Q128;
    const unclaimedFees1 = positionFees.value.tokensOwed1 + (positionFees.value.onChainLiquidity * feeGrowthInside1DeltaX128) / Q128;

    const fees0Formatted = Number(unclaimedFees0) / 10 ** token0.decimals;
    const fees1Formatted = Number(unclaimedFees1) / 10 ** token1.decimals;

    const priceMap = await this.priceService.getPrices([
      { chainId: token0.chainId, address: token0.address },
      { chainId: token1.chainId, address: token1.address },
    ]);

    const price0USD = priceMap.get(cacheKey(token0.chainId, token0.address))?.priceUSD ?? 0;
    const price1USD = priceMap.get(cacheKey(token1.chainId, token1.address))?.priceUSD ?? 0;

    return ok({
      token0: token0.response,
      token1: token1.response,
      unclaimedFees: {
        token0: { value: fees0Formatted, USDValue: fees0Formatted * price0USD },
        token1: { value: fees1Formatted, USDValue: fees1Formatted * price1USD },
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
