import { DomainError } from "shared/errors/base.error";

export enum PositionErrorCode {
  POSITION_NOT_FOUND = "POSITION_NOT_FOUND",
  GRAPHQL_ERROR = "GRAPHQL_ERROR",
  UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
}

const errorMessages: Record<PositionErrorCode, string> = {
  [PositionErrorCode.POSITION_NOT_FOUND]: "Position not found",
  [PositionErrorCode.GRAPHQL_ERROR]: "GraphQL error",
  [PositionErrorCode.UNEXPECTED_ERROR]: "Unexpected error",
};

export class PositionError extends DomainError<PositionErrorCode> {
  static readonly CODE = PositionErrorCode;
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
