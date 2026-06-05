import { err, ok, type Result } from "neverthrow";
import { inject, injectable } from "tsyringe";

import type { PositionFeesCache } from "../data/position-fees.cache";
import { PositionsRepository } from "../data/positions.repository";
import { POSITION_FEES_CACHE } from "../di/tokens";
import type { PositionEntity } from "../domain/entities/position.entity";
import { PositionError } from "../domain/errors/position.error";
import type { ComputedFees } from "../domain/utils/fee-math";
import { computeUnclaimedFees } from "../domain/utils/fee-math";
import { type MapPositionResult, type MapperUnclaimedFees, mapV3PositionToContract } from "../presentation/mappers/position.mapper";

export interface GetPositionParams {
  id: string;
}

@injectable()
export class GetPositionUseCase {
  constructor(
    @inject(PositionsRepository) public readonly positionsRepository: PositionsRepository,
    @inject(POSITION_FEES_CACHE) private readonly feesCache: PositionFeesCache,
  ) {}

  async execute({ id }: GetPositionParams): Promise<Result<MapPositionResult, PositionError>> {
    const chainId = this.positionsRepository.chainContext.chain.id;

    const result = await this.positionsRepository.getPosition(id);
    if (result.isErr()) return err(result.error);

    const dto = result.value;

    const poolStateResult = await this.positionsRepository.getPoolState(dto.pool.id);
    if (poolStateResult.isErr()) return err(new PositionError(PositionError.CODE.UNEXPECTED_ERROR));

    const entity = dto.toDomain(poolStateResult.value);

    const fees = await this.fetchFees(chainId, id, entity);

    return ok(
      mapV3PositionToContract({
        entity,
        chainId,
        unclaimedFees: toMapperFees(fees),
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

const toMapperFees = (fees: ComputedFees | null): MapperUnclaimedFees | null =>
  fees ? { token0Raw: fees.token0Raw, token1Raw: fees.token1Raw } : null;
