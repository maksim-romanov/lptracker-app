import { err, ok } from "neverthrow";
import { inject, injectable } from "tsyringe";

import type { TokenPriceService } from "token-prices/domain/token-price-service";
import { cacheKey } from "token-prices/domain/types";
import { TOKEN_PRICE_SERVICE } from "token-prices/di/tokens";
import { PositionsRepository } from "../data/positions.repository";

@injectable()
export class GetPositionUseCase {
  constructor(
    @inject(PositionsRepository) public readonly positionsRepository: PositionsRepository,
    @inject(TOKEN_PRICE_SERVICE) private readonly priceService: TokenPriceService,
  ) {}

  async execute(id: string) {
    const result = await this.positionsRepository.getPosition(id);
    if (result.isErr()) return err(result.error);

    const entity = result.value.toDomain();
    const { token0, token1 } = entity.pool;

    const priceMap = await this.priceService.getPrices([
      { chainId: token0.chainId, address: token0.address },
      { chainId: token1.chainId, address: token1.address },
    ]);

    const prices = {
      token0PriceUSD: priceMap.get(cacheKey(token0.chainId, token0.address))?.priceUSD ?? 0,
      token1PriceUSD: priceMap.get(cacheKey(token1.chainId, token1.address))?.priceUSD ?? 0,
    };

    return ok(entity.toResponse(prices));
  }
}
