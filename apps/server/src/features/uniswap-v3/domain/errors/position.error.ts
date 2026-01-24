import { DomainError } from "../../../../shared/errors/domain.error";

export enum PositionErrorCode {
	POSITION_NOT_FOUND = "POSITION_NOT_FOUND",
	POOL_NOT_FOUND = "POOL_NOT_FOUND",
	INVALID_ADDRESS = "INVALID_ADDRESS",
	FETCH_FAILED = "FETCH_FAILED",
	CALCULATION_FAILED = "CALCULATION_FAILED",
	GRAPHQL_ERROR = "GRAPHQL_ERROR",
}

const errorMessages: Record<PositionErrorCode, string> = {
	[PositionErrorCode.POSITION_NOT_FOUND]: "Position not found",
	[PositionErrorCode.POOL_NOT_FOUND]: "Pool not found",
	[PositionErrorCode.INVALID_ADDRESS]: "Invalid Ethereum address format",
	[PositionErrorCode.FETCH_FAILED]: "Failed to fetch position data",
	[PositionErrorCode.CALCULATION_FAILED]: "Failed to calculate position details",
	[PositionErrorCode.GRAPHQL_ERROR]: "GraphQL query failed",
};

export class PositionError extends DomainError<PositionErrorCode> {
	name = "PositionError";

	constructor(code: PositionErrorCode, message?: string, context: Record<string, unknown> = {}) {
		super(code, message ?? errorMessages[code], context);
	}

	get isNotFound(): boolean {
		return this.code === PositionErrorCode.POSITION_NOT_FOUND;
	}

	static isInstance(error: unknown): error is PositionError {
		return error instanceof PositionError;
	}
}
