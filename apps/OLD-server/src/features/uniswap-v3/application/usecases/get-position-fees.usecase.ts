import { injectable, inject } from "tsyringe";
import { Result, ok, err } from "neverthrow";
import { UseCase } from "../../../../shared/base/usecase";
import { PositionError, PositionErrorCode } from "../../domain/errors/position.error";
import { PositionsRepository } from "../../data/positions.repository";
import { POSITIONS_REPOSITORY } from "../../di/tokens";
// Import existing fees logic (will be refactored later)
import { getPositionFeesLogic } from "../../../../api/v1/positions/fees";

type TokenInfo = {
	address: string;
	symbol: string;
	decimals: number;
};

type FeesPerPair = {
	label: string;
	token0: number;
	token1: number;
	total: number;
};

export type GetPositionFeesOutput = {
	positionId: string;
	token0: TokenInfo;
	token1: TokenInfo;
	unclaimedFees: {
		token0PerToken1: FeesPerPair;
		token1PerToken0: FeesPerPair;
		raw: {
			token0: string;
			token1: string;
		};
	};
};

@injectable()
export class GetPositionFeesUseCase extends UseCase<Result<GetPositionFeesOutput, PositionError>, string> {
	constructor(@inject(POSITIONS_REPOSITORY) private readonly repository: PositionsRepository) {
		super();
	}

	async execute(tokenId: string): Promise<Result<GetPositionFeesOutput, PositionError>> {
		try {
			// Temporarily use the old logic
			// TODO: refactor fees calculation into PositionsService
			const result = await getPositionFeesLogic(tokenId);
			return ok(result);
		} catch (error: unknown) {
			if (error && typeof error === "object" && "status" in error && error.status === 404) {
				return err(new PositionError(PositionErrorCode.POSITION_NOT_FOUND));
			}
			return err(new PositionError(PositionErrorCode.FETCH_FAILED, undefined, { error }));
		}
	}
}
