import { err, ok } from "neverthrow";
import { inject, injectable } from "tsyringe";

import type { TokenPriceService } from "token-prices/domain/token-price-service";
import { cacheKey } from "token-prices/domain/types";
import { TOKEN_PRICE_SERVICE } from "token-prices/di/tokens";
import { PositionsRepository } from "../data/positions.repository";
import { computeUnclaimedFees } from "../domain/utils/fee-math";

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

    const fees = computeUnclaimedFees(
      positionFees.value,
      entity.pool.currentTick,
      entity.tickLower,
      entity.tickUpper,
      token0.decimals,
      token1.decimals,
    );

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
        token0: { value: fees.token0, USDValue: fees.token0 * price0USD },
        token1: { value: fees.token1, USDValue: fees.token1 * price1USD },
      },
    });
  }
}
