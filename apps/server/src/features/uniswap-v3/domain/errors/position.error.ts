import { DomainError, type DomainErrorOpts } from "#shared/errors/base.error";

// 15 minutes: well beyond normal reorg depth on mainnet/base/arbitrum, well below a lag that would mislead a user.
export const MAX_INDEX_LAG_SECONDS = 900;

export enum PositionErrorCode {
  POSITION_NOT_FOUND = "POSITION_NOT_FOUND",
  GRAPHQL_ERROR = "GRAPHQL_ERROR",
  UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
  INDEX_STALE = "INDEX_STALE",
  INDEX_UNHEALTHY = "INDEX_UNHEALTHY",
}

const errorMessages: Record<PositionErrorCode, string> = {
  [PositionErrorCode.POSITION_NOT_FOUND]: "Position not found",
  [PositionErrorCode.GRAPHQL_ERROR]: "GraphQL error",
  [PositionErrorCode.UNEXPECTED_ERROR]: "Unexpected error",
  [PositionErrorCode.INDEX_STALE]: "Index is stale",
  [PositionErrorCode.INDEX_UNHEALTHY]: "Index reports indexing errors",
};

export class PositionError extends DomainError<PositionErrorCode> {
  static readonly CODES = PositionErrorCode;

  constructor(code: PositionErrorCode, message?: string, context?: Record<string, unknown>) {
    super(code, message ?? errorMessages[code], context);
  }

  get isNotFound(): boolean {
    return this.code === PositionErrorCode.POSITION_NOT_FOUND;
  }

  static POSITION_NOT_FOUND(opts?: DomainErrorOpts) {
    return PositionError.create(PositionError.CODES.POSITION_NOT_FOUND, opts);
  }

  static GRAPHQL_ERROR(opts?: DomainErrorOpts) {
    return PositionError.create(PositionError.CODES.GRAPHQL_ERROR, opts);
  }

  static UNEXPECTED_ERROR(opts?: DomainErrorOpts) {
    return PositionError.create(PositionError.CODES.UNEXPECTED_ERROR, opts);
  }

  static INDEX_STALE(context: { chainId: number; lagSeconds: number }) {
    return PositionError.create(PositionError.CODES.INDEX_STALE, {
      message: `Index is ${context.lagSeconds}s behind on chain ${context.chainId}`,
      context,
    });
  }

  static INDEX_UNHEALTHY(context: { chainId: number }) {
    return PositionError.create(PositionError.CODES.INDEX_UNHEALTHY, {
      message: `Index reports indexing errors on chain ${context.chainId}`,
      context,
    });
  }

  static isInstance(error: unknown): error is PositionError {
    return error instanceof PositionError;
  }
}
