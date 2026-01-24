import { injectable, inject } from "tsyringe";
import { Result, ok, err } from "neverthrow";
import { UseCase } from "../../../../shared/base/usecase";
import { PositionError, PositionErrorCode } from "../../domain/errors/position.error";
import { PositionsRepository } from "../../data/positions.repository";
import type { PositionsService, PriceRange, PositionAmounts } from "../../data/positions.service";
import { POSITIONS_REPOSITORY, POSITIONS_SERVICE } from "../../di/tokens";
import { OrderDirection, Position_OrderBy } from "../../../../gql/graphql";

export type GetWalletPositionsInput = {
	owner: string;
	first: number;
	skip: number;
	closed: boolean;
	orderBy: Position_OrderBy;
	orderDirection: OrderDirection;
	detail: "basic" | "full";
};

type PositionPool = {
	id: string;
	feeTier: number;
	currentTick: number;
	sqrtPriceX96: string;
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

export type PositionWithDetails = {
	id: string;
	liquidity: string;
	tickLower: number;
	tickUpper: number;
	pool: PositionPool;
	links: {
		self: string;
		fees: string;
	};
	amounts?: PositionAmounts;
	range?: PriceRange;
};

export type GetWalletPositionsOutput = {
	owner: string;
	positions: PositionWithDetails[];
	pagination: {
		first: number;
		skip: number;
		returned: number;
		hasMore: boolean;
	};
	filters: {
		closed: boolean;
		orderBy: Position_OrderBy;
		orderDirection: OrderDirection;
	};
};

@injectable()
export class GetWalletPositionsUseCase extends UseCase<
	Result<GetWalletPositionsOutput, PositionError>,
	GetWalletPositionsInput
> {
	constructor(
		@inject(POSITIONS_REPOSITORY) private readonly repository: PositionsRepository,
		@inject(POSITIONS_SERVICE) private readonly service: PositionsService,
	) {
		super();
	}

	async execute(input: GetWalletPositionsInput): Promise<Result<GetWalletPositionsOutput, PositionError>> {
		// Validate address
		if (!/^0x[a-fA-F0-9]{40}$/.test(input.owner)) {
			return err(new PositionError(PositionErrorCode.INVALID_ADDRESS));
		}

		// Get positions from GraphQL
		const positionsResult = await this.repository.getWalletPositions(
			input.owner,
			{ first: input.first, skip: input.skip },
			{ closed: input.closed, orderBy: input.orderBy, orderDirection: input.orderDirection },
		);

		if (positionsResult.isErr()) {
			return err(positionsResult.error);
		}

		const positionDtos = positionsResult.value;

		// Convert DTO to Entity
		const entities = positionDtos.map((dto) => dto.toDomain());

		// Convert entities to output format
		const positionsWithDetails = entities.map((entity) => {
			const position: PositionWithDetails = {
				id: entity.id,
				liquidity: entity.liquidity.toString(),
				tickLower: entity.tickLower,
				tickUpper: entity.tickUpper,
				pool: {
					id: entity.pool.id,
					feeTier: entity.pool.feeTier,
					currentTick: entity.pool.currentTick,
					sqrtPriceX96: entity.pool.sqrtPriceX96,
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
				links: {
					self: `/api/v1/positions/${entity.id}`,
					fees: `/api/v1/positions/${entity.id}/fees`,
				},
			};

			// Enrich with calculations if detail=full
			if (input.detail === "full") {
				const amountsResult = this.service.calculateAmounts(entity);
				const rangeResult = this.service.calculatePriceRange(entity);

				if (amountsResult.isOk()) {
					position.amounts = amountsResult.value;
				}
				if (rangeResult.isOk()) {
					position.range = rangeResult.value;
				}
			}

			return position;
		});

		return ok({
			owner: input.owner,
			positions: positionsWithDetails,
			pagination: {
				first: input.first,
				skip: input.skip,
				returned: positionsWithDetails.length,
				hasMore: positionsWithDetails.length === input.first,
			},
			filters: {
				closed: input.closed,
				orderBy: input.orderBy,
				orderDirection: input.orderDirection,
			},
		});
	}
}
