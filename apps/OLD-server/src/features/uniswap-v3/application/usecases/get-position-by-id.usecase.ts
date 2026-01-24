import { injectable, inject } from "tsyringe";
import { Result, ok, err } from "neverthrow";
import { UseCase } from "../../../../shared/base/usecase";
import { PositionError, PositionErrorCode } from "../../domain/errors/position.error";
import { PositionsRepository } from "../../data/positions.repository";
import type { PositionsService, PriceRange, PositionAmounts } from "../../data/positions.service";
import { POSITIONS_REPOSITORY, POSITIONS_SERVICE } from "../../di/tokens";

type PositionPool = {
	feeTier: number;
	currentTick: number;
	token0: {
		id: string;
		symbol: string;
		decimals: number;
	};
	token1: {
		id: string;
		symbol: string;
		decimals: number;
	};
};

export type GetPositionByIdOutput = {
	id: string;
	tickLower: number;
	tickUpper: number;
	liquidity: string;
	pool: PositionPool;
	amounts: PositionAmounts;
	range: PriceRange;
};

@injectable()
export class GetPositionByIdUseCase extends UseCase<Result<GetPositionByIdOutput, PositionError>, string> {
	constructor(
		@inject(POSITIONS_REPOSITORY) private readonly repository: PositionsRepository,
		@inject(POSITIONS_SERVICE) private readonly service: PositionsService,
	) {
		super();
	}

	async execute(tokenId: string): Promise<Result<GetPositionByIdOutput, PositionError>> {
		const positionResult = await this.repository.getPositionById(tokenId);

		if (positionResult.isErr()) {
			return err(positionResult.error);
		}

		if (!positionResult.value) {
			return err(new PositionError(PositionErrorCode.POSITION_NOT_FOUND));
		}

		const entity = positionResult.value.toDomain();

		if (!entity.pool) {
			return err(new PositionError(PositionErrorCode.POOL_NOT_FOUND));
		}

		const amountsResult = this.service.calculateAmounts(entity);
		const rangeResult = this.service.calculatePriceRange(entity);

		if (amountsResult.isErr()) {
			return err(amountsResult.error);
		}

		if (rangeResult.isErr()) {
			return err(rangeResult.error);
		}

		return ok({
			id: entity.id,
			tickLower: entity.tickLower,
			tickUpper: entity.tickUpper,
			liquidity: entity.liquidity.toString(),
			pool: {
				feeTier: entity.pool.feeTier,
				currentTick: entity.pool.currentTick,
				token0: {
					id: entity.pool.token0.address,
					symbol: entity.pool.token0.symbol,
					decimals: entity.pool.token0.decimals,
				},
				token1: {
					id: entity.pool.token1.address,
					symbol: entity.pool.token1.symbol,
					decimals: entity.pool.token1.decimals,
				},
			},
			amounts: amountsResult.value,
			range: rangeResult.value,
		});
	}
}
