import { err, ok } from "neverthrow";
import { TOKEN_PRICE_SERVICE } from "token-prices/di/tokens";
import type { TokenPriceService } from "token-prices/domain/token-price-service";
import { cacheKey } from "token-prices/domain/types";
import { inject, injectable } from "tsyringe";

import type { PositionFeesCache } from "../data/position-fees.cache";
import { PositionsRepository } from "../data/positions.repository";
import { POSITION_FEES_CACHE } from "../di/tokens";
import type { PositionEntity } from "../domain/entities/position.entity";
import type { ComputedFees } from "../domain/utils/fee-math";
import { computeUnclaimedFees } from "../domain/utils/fee-math";

@injectable()
export class GetPositionUseCase {
  constructor(
    @inject(PositionsRepository) public readonly positionsRepository: PositionsRepository,
    @inject(TOKEN_PRICE_SERVICE) private readonly priceService: TokenPriceService,
    @inject(POSITION_FEES_CACHE) private readonly feesCache: PositionFeesCache,
  ) {}

  async execute(id: string) {
    const result = await this.positionsRepository.getPosition(id);
    if (result.isErr()) return err(result.error);

    const entity = result.value.toDomain();
    const { token0, token1 } = entity.pool;

    // Run price and fee fetch in parallel
    const [priceMap, fees] = await Promise.all([
      this.priceService.getPrices([
        { chainId: token0.chainId, address: token0.address },
        { chainId: token1.chainId, address: token1.address },
      ]),
      this.fetchFees(token0.chainId, id, entity),
    ]);

    return ok(
      entity.toResponse({
        token0PriceUSD: priceMap.get(cacheKey(token0.chainId, token0.address))?.priceUSD ?? 0,
        token1PriceUSD: priceMap.get(cacheKey(token1.chainId, token1.address))?.priceUSD ?? 0,
        unclaimedFees: fees,
      }),
    );
  }

  private async fetchFees(chainId: number, positionId: string, entity: PositionEntity): Promise<ComputedFees | null> {
    const cached = await this.feesCache.getFees(chainId, positionId);
    if (cached) return cached;

    const result = await this.positionsRepository.getPositionFees(entity);
    if (result.isErr()) return null;

    const fees = computeUnclaimedFees(
      result.value,
      entity.pool.currentTick,
      entity.tickLower,
      entity.tickUpper,
      entity.pool.token0.decimals,
      entity.pool.token1.decimals,
    );
    await this.feesCache.setFees(chainId, positionId, fees);
    return fees;
  }
}
