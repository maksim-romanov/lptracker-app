import { ok } from "neverthrow";
import { TOKEN_PRICE_SERVICE } from "token-prices/di/tokens";
import type { TokenPriceService } from "token-prices/domain/token-price-service";
import type { TokenPriceQuery } from "token-prices/domain/types";
import { cacheKey } from "token-prices/domain/types";
import { inject, injectable } from "tsyringe";
import { arbitrum } from "viem/chains";

import type { GraphQLPositionDto } from "../data/dto/graphql-position.dto";
import type { PositionFeesCache } from "../data/position-fees.cache";
import { PositionsRepository } from "../data/positions.repository";
import { getContainer } from "../di/containers";
import { POSITION_FEES_CACHE } from "../di/tokens";
import { UNISWAP_V3_PROTOCOL } from "../domain/constants/protocol";
import type { PositionEntity } from "../domain/entities/position.entity";
import type { ComputedFees } from "../domain/utils/fee-math";
import { computeUnclaimedFees } from "../domain/utils/fee-math";
import type { UniswapV3WrappedPosition } from "../presentation/schemas/response.schemas";

export interface GetWalletPositionsParams {
  owner: string;
  chainIds?: number[];
  pagination?: { limit: number; offset: number };
  filters?: { closed: boolean };
}

@injectable()
export class GetWalletPositionsUseCase {
  constructor(
    @inject(TOKEN_PRICE_SERVICE) private readonly priceService: TokenPriceService,
    @inject(POSITION_FEES_CACHE) private readonly feesCache: PositionFeesCache,
  ) {}

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

    // Run price fetch and fee fetch in parallel
    const [priceMap, feesMap] = await Promise.all([this.priceService.getPrices([...tokenQueries.values()]), this.fetchAllFees(entities)]);

    const wrappedPositions: UniswapV3WrappedPosition[] = entities.map(({ chainId, entity }) => {
      const { token0, token1 } = entity.pool;

      return {
        protocol: UNISWAP_V3_PROTOCOL,
        chainId,
        data: entity.toResponse({
          token0PriceUSD: priceMap.get(cacheKey(token0.chainId, token0.address))?.priceUSD ?? 0,
          token1PriceUSD: priceMap.get(cacheKey(token1.chainId, token1.address))?.priceUSD ?? 0,
          unclaimedFees: feesMap.get(entity.id) ?? null,
        }),
      };
    });

    return ok(wrappedPositions);
  }

  private async fetchAllFees(entries: { chainId: number; entity: PositionEntity }[]): Promise<Map<string, ComputedFees>> {
    const allFees = new Map<string, ComputedFees>();

    const byChain = entries.reduce((map, { chainId, entity }) => {
      const list = map.get(chainId);
      list ? list.push(entity) : map.set(chainId, [entity]);
      return map;
    }, new Map<number, PositionEntity[]>());

    await Promise.all(
      Array.from(byChain.entries()).map(async ([chainId, positions]) => {
        const { cached, uncached } = await this.feesCache.partition(chainId, positions);

        for (const [id, fees] of cached) allFees.set(id, fees);

        if (uncached.length === 0) return;

        try {
          const repository = getContainer(chainId).resolve(PositionsRepository);
          const result = await repository.getBatchPositionFees(uncached);
          if (result.isErr()) return;

          const cacheWrites: Promise<void>[] = [];
          for (const position of uncached) {
            const raw = result.value.get(position.id);
            if (!raw) continue;

            const fees = computeUnclaimedFees(
              raw,
              position.pool.currentTick,
              position.tickLower,
              position.tickUpper,
              position.pool.token0.decimals,
              position.pool.token1.decimals,
            );
            allFees.set(position.id, fees);
            cacheWrites.push(this.feesCache.setFees(chainId, position.id, fees));
          }
          await Promise.all(cacheWrites);
        } catch {
          // RPC failure — positions without fees will get null
        }
      }),
    );

    return allFees;
  }
}
