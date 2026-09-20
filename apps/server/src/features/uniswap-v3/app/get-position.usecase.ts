import { err, ok, type Result } from "neverthrow";
import { inject, injectable } from "tsyringe";

import type { PositionOwedCache } from "../data/position-owed.cache";
import { PositionsRepository } from "../data/positions.repository";
import { POSITION_OWED_CACHE } from "../di/tokens";
import type { PositionEntity } from "../domain/entities/position.entity";
import type { PositionError } from "../domain/errors/position.error";
import type { ComputedOwedBalance } from "../domain/utils/fee-math";
import { computeOwedBalance } from "../domain/utils/fee-math";
import { type MapperOwedBalance, mapV3PositionToContract } from "./mappers/position.mapper";
import type { MapPositionResult } from "#shared/contracts";

export interface GetPositionParams {
  id: string;
}

@injectable()
export class GetPositionUseCase {
  constructor(
    @inject(PositionsRepository) public readonly positionsRepository: PositionsRepository,
    @inject(POSITION_OWED_CACHE) private readonly owedCache: PositionOwedCache,
  ) {}

  async execute({ id }: GetPositionParams): Promise<Result<MapPositionResult, PositionError>> {
    const chainId = this.positionsRepository.chainContext.chain.id;

    const result = await this.positionsRepository.getPosition(id);
    if (result.isErr()) return err(result.error);

    const dto = result.value;

    const blockResult = await this.positionsRepository.pinBlock();
    if (blockResult.isErr()) return err(blockResult.error);
    const blockNumber = blockResult.value;

    const poolStateResult = await this.positionsRepository.getPoolState(dto.pool.id, blockNumber);
    if (poolStateResult.isErr()) return err(poolStateResult.error);

    const entity = dto.toDomain(poolStateResult.value);

    const owed = await this.fetchOwed(chainId, id, entity, blockNumber);

    return ok(
      mapV3PositionToContract({
        entity,
        chainId,
        owed: toMapperOwed(owed),
      }),
    );
  }

  private async fetchOwed(
    chainId: number,
    positionId: string,
    entity: PositionEntity,
    blockNumber: bigint,
  ): Promise<ComputedOwedBalance | null> {
    const cached = await this.owedCache.getOwed(chainId, positionId);
    if (cached) return cached;

    const result = await this.positionsRepository.getPositionOwed(entity, blockNumber);
    if (result.isErr()) return null;

    const owed = computeOwedBalance(
      result.value,
      entity.pool.currentTick,
      entity.tickLower,
      entity.tickUpper,
      entity.pool.token0.decimals,
      entity.pool.token1.decimals,
    );
    await this.owedCache.setOwed(chainId, positionId, owed);
    return owed;
  }
}

const toMapperOwed = (owed: ComputedOwedBalance | null): MapperOwedBalance | null =>
  owed ? { token0Raw: owed.token0Raw, token1Raw: owed.token1Raw } : null;
