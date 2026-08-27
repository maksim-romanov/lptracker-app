import type { MappedError } from "#app/protocols/types";
import { PositionError, PositionErrorCode } from "#features/uniswap-v3/domain/errors/position.error";
import { ERROR_CODES } from "#shared/contracts";
import type { DomainError } from "#shared/errors/base.error";

export function mapV3Error(error: DomainError): MappedError | undefined {
  if (!PositionError.isInstance(error)) return undefined;
  switch (error.code) {
    case PositionErrorCode.POSITION_NOT_FOUND:
      return { status: 404, code: ERROR_CODES.POSITION_NOT_FOUND, message: error.message };
    case PositionErrorCode.GRAPHQL_ERROR:
      return { status: 502, code: ERROR_CODES.UPSTREAM_UNAVAILABLE, message: error.message };
    case PositionErrorCode.UNEXPECTED_ERROR:
      return { status: 500, code: ERROR_CODES.INTERNAL_ERROR, message: error.message };
    default:
      return { status: 500, code: ERROR_CODES.INTERNAL_ERROR, message: error.message };
  }
}
