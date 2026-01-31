import { ok } from "neverthrow";
import { TOKEN_PRICE_SERVICE } from "token-prices/di/tokens";
import type { TokenPriceService } from "token-prices/domain/token-price-service";
import type { TokenPriceQuery } from "token-prices/domain/types";
import { cacheKey } from "token-prices/domain/types";
import { inject, injectable } from "tsyringe";
import { arbitrum } from "viem/chains";

import type { GraphQLPositionDto } from "../data/dto/graphql-position.dto";
import { PositionsRepository } from "../data/positions.repository";
import { getContainer } from "../di/containers";
import { UNISWAP_V3_PROTOCOL } from "../domain/constants/protocol";
import type { UniswapV3WrappedPosition } from "../presentation/schemas/response.schemas";

export interface GetWalletPositionsParams {
  owner: string;
  chainIds?: number[];
  pagination?: { limit: number; offset: number };
  filters?: { closed: boolean };
}

@injectable()
export class GetWalletPositionsUseCase {
  constructor(@inject(TOKEN_PRICE_SERVICE) private readonly priceService: TokenPriceService) {}

  async execute(params: GetWalletPositionsParams) {
    const { owner, chainIds = [arbitrum.id], pagination, filters } = params;

    const results = await Promise.all(
      chainIds.map(async (chainId) => {
        const repository = getContainer(chainId).resolve(PositionsRepository);
        const result = await repository.getWalletPositions(
          owner,
          pagination ? { first: pagination.limit, skip: pagination.offset } : undefined,
          filters,
        );

        if (result.isErr()) {
          return { chainId, positions: [] as GraphQLPositionDto[] };
        }

        return { chainId, positions: result.value };
      }),
    );

    const entities = results.flatMap(({ chainId, positions }) => positions.map((dto) => ({ chainId, entity: dto.toDomain() })));

    // Collect unique tokens for batch price fetch
    const tokenQueries = new Map<string, TokenPriceQuery>();
    for (const { entity } of entities) {
      const { token0, token1 } = entity.pool;
      tokenQueries.set(cacheKey(token0.chainId, token0.address), { chainId: token0.chainId, address: token0.address });
      tokenQueries.set(cacheKey(token1.chainId, token1.address), { chainId: token1.chainId, address: token1.address });
    }

    const priceMap = await this.priceService.getPrices([...tokenQueries.values()]);

    const wrappedPositions: UniswapV3WrappedPosition[] = entities.map(({ chainId, entity }) => {
      const { token0, token1 } = entity.pool;
      const prices = {
        token0PriceUSD: priceMap.get(cacheKey(token0.chainId, token0.address))?.priceUSD ?? 0,
        token1PriceUSD: priceMap.get(cacheKey(token1.chainId, token1.address))?.priceUSD ?? 0,
      };

      return {
        protocol: UNISWAP_V3_PROTOCOL,
        chainId,
        data: entity.toResponse(prices),
      };
    });

    return ok(wrappedPositions);
  }
}
