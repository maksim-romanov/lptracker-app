import { getLogger } from "@mars-909/logger";
import { err, ok, type Result } from "neverthrow";
import type { MapPositionResult } from "shared/contracts";
import { inject, injectable } from "tsyringe";

import type { PositionFeesCache } from "../data/position-fees.cache";
import { PositionsRepository } from "../data/positions.repository";
import { getContainer } from "../di/containers";
import { POSITION_FEES_CACHE } from "../di/tokens";
import type { PositionEntity } from "../domain/entities/position.entity";
import type { PositionError } from "../domain/errors/position.error";
import type { ComputedFees } from "../domain/utils/fee-math";
import { computeUnclaimedFees } from "../domain/utils/fee-math";
import { type MapperUnclaimedFees, mapV3PositionToContract } from "../presentation/mappers/position.mapper";

const logger = getLogger(["server", "v3", "usecase"]);

export interface GetWalletPositionsParams {
  owner: string;
  chainId: number;
  pagination?: { limit: number; offset: number };
  filters?: { closed: boolean };
}

@injectable()
export class GetWalletPositionsUseCase {
  constructor(@inject(POSITION_FEES_CACHE) private readonly feesCache: PositionFeesCache) {}

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

    const poolAddresses = [...new Set(positionDtos.map((dto) => dto.pool.id))];
    const poolStatesResult = await repository.getPoolStates(poolAddresses);
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

    const feesMap = await this.fetchAllFees(chainId, repository, entities);

    return ok(
      entities.map((entity) =>
        mapV3PositionToContract({
          entity,
          chainId,
          unclaimedFees: toMapperFees(feesMap.get(entity.id)),
        }),
      ),
    );
  }

  private async fetchAllFees(chainId: number, repository: PositionsRepository, entities: PositionEntity[]): Promise<Map<string, ComputedFees>> {
    const allFees = new Map<string, ComputedFees>();
    if (entities.length === 0) return allFees;

    const { cached, uncached } = await this.feesCache.partition(chainId, entities);
    for (const [id, fees] of cached) allFees.set(id, fees);

    if (uncached.length === 0) return allFees;

    try {
      const result = await repository.getBatchPositionFees(uncached);
      if (result.isErr()) return allFees;

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
    } catch (error) {
      logger.error("fee fetch failed", {
        chainId,
        count: uncached.length,
        error,
      });
    }

    return allFees;
  }
}

const toMapperFees = (fees: ComputedFees | undefined): MapperUnclaimedFees | null =>
  fees ? { token0Raw: fees.token0Raw, token1Raw: fees.token1Raw } : null;
