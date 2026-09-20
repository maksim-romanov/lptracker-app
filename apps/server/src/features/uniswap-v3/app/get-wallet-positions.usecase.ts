import { getLogger } from "@depthly/logger";
import { err, ok, type Result } from "neverthrow";
import { inject, injectable } from "tsyringe";

import type { PositionOwedCache } from "../data/position-owed.cache";
import { PositionsRepository } from "../data/positions.repository";
import { getContainer } from "../di/containers";
import { POSITION_OWED_CACHE } from "../di/tokens";
import type { PositionEntity } from "../domain/entities/position.entity";
import type { PositionError } from "../domain/errors/position.error";
import type { ComputedOwedBalance } from "../domain/utils/fee-math";
import { computeOwedBalance } from "../domain/utils/fee-math";
import { type MapperOwedBalance, mapV3PositionToContract } from "./mappers/position.mapper";
import type { MapPositionResult } from "#shared/contracts";

const logger = getLogger(["server", "v3", "usecase"]);

export interface GetWalletPositionsParams {
  owner: string;
  chainId: number;
  pagination?: { limit: number; offset: number };
  filters?: { closed: boolean };
}

@injectable()
export class GetWalletPositionsUseCase {
  constructor(@inject(POSITION_OWED_CACHE) private readonly owedCache: PositionOwedCache) {}

  async execute(params: GetWalletPositionsParams): Promise<Result<MapPositionResult[], PositionError>> {
    const { owner, chainId, pagination, filters } = params;

    const repository = getContainer(chainId).resolve(PositionsRepository);

    const positionsResult = await repository.getWalletPositions(
      owner,
      pagination ? { first: pagination.limit, skip: pagination.offset } : undefined,
      filters,
    );
    if (positionsResult.isErr()) return err(positionsResult.error);

    const positionDtos = positionsResult.value;
    if (positionDtos.length === 0) return ok([]);

    const blockResult = await repository.pinBlock();
    if (blockResult.isErr()) return err(blockResult.error);
    const blockNumber = blockResult.value;

    const poolAddresses = [...new Set(positionDtos.map((dto) => dto.pool.id))];
    const poolStatesResult = await repository.getPoolStates(poolAddresses, blockNumber);
    if (poolStatesResult.isErr()) return err(poolStatesResult.error);
    const poolStates = poolStatesResult.value;

    const droppedForMissingPoolState: { positionId: string; poolId: string }[] = [];
    const entities = positionDtos
      .map((dto) => {
        const ps = poolStates.get(dto.pool.id);
        if (!ps) {
          droppedForMissingPoolState.push({ positionId: dto.id, poolId: dto.pool.id });
          return null;
        }
        return dto.toDomain(ps);
      })
      .filter((e): e is PositionEntity => e !== null);

    if (droppedForMissingPoolState.length > 0) {
      logger.warning("dropped positions (no pool state)", {
        chainId,
        owner,
        dropped: droppedForMissingPoolState.length,
        total: positionDtos.length,
        droppedIds: droppedForMissingPoolState,
      });
    }

    const owedMap = await this.fetchAllOwed(chainId, repository, entities, blockNumber);

    return ok(
      entities.map((entity) =>
        mapV3PositionToContract({
          entity,
          chainId,
          owed: toMapperOwed(owedMap.get(entity.id)),
        }),
      ),
    );
  }

  private async fetchAllOwed(
    chainId: number,
    repository: PositionsRepository,
    entities: PositionEntity[],
    blockNumber: bigint,
  ): Promise<Map<string, ComputedOwedBalance>> {
    const allOwed = new Map<string, ComputedOwedBalance>();
    if (entities.length === 0) return allOwed;

    const { cached, uncached } = await this.owedCache.partition(chainId, entities);
    for (const [id, owed] of cached) allOwed.set(id, owed);

    if (uncached.length === 0) return allOwed;

    try {
      const result = await repository.getBatchPositionOwed(uncached, blockNumber);
      if (result.isErr()) return allOwed;

      const cacheWrites: Promise<void>[] = [];
      for (const position of uncached) {
        const raw = result.value.get(position.id);
        if (!raw) continue;

        const owed = computeOwedBalance(
          raw,
          position.pool.currentTick,
          position.tickLower,
          position.tickUpper,
          position.pool.token0.decimals,
          position.pool.token1.decimals,
        );
        allOwed.set(position.id, owed);
        cacheWrites.push(this.owedCache.setOwed(chainId, position.id, owed));
      }
      await Promise.all(cacheWrites);
    } catch (error) {
      logger.error("owed balance fetch failed", {
        chainId,
        count: uncached.length,
        error,
      });
    }

    return allOwed;
  }
}

const toMapperOwed = (owed: ComputedOwedBalance | undefined): MapperOwedBalance | null =>
  owed ? { token0Raw: owed.token0Raw, token1Raw: owed.token1Raw } : null;
