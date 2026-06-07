import { DomainError, type DomainErrorOpts } from "shared/errors/base.error";

export enum StablesErrorCode {
  UPSTREAM_ERROR = "UPSTREAM_ERROR",
  UPSTREAM_UNREACHABLE = "UPSTREAM_UNREACHABLE",
  INVALID_RESPONSE = "INVALID_RESPONSE",
}

const errorMessages: Record<StablesErrorCode, string> = {
  [StablesErrorCode.UPSTREAM_ERROR]: "tokens-data /v1/stables returned a non-2xx response",
  [StablesErrorCode.UPSTREAM_UNREACHABLE]: "tokens-data /v1/stables is unreachable",
  [StablesErrorCode.INVALID_RESPONSE]: "tokens-data /v1/stables returned an unexpected payload",
};

export class StablesError extends DomainError<StablesErrorCode> {
  static readonly CODES = StablesErrorCode;

  constructor(code: StablesErrorCode, message?: string, context?: Record<string, unknown>) {
    super(code, message ?? errorMessages[code], context);
  }

  static UPSTREAM_ERROR(opts?: DomainErrorOpts) {
    return StablesError.create(StablesError.CODES.UPSTREAM_ERROR, opts);
  }

  static UPSTREAM_UNREACHABLE(opts?: DomainErrorOpts) {
    return StablesError.create(StablesError.CODES.UPSTREAM_UNREACHABLE, opts);
  }

  static INVALID_RESPONSE(opts?: DomainErrorOpts) {
    return StablesError.create(StablesError.CODES.INVALID_RESPONSE, opts);
  }

  static isInstance(error: unknown): error is StablesError {
    return error instanceof StablesError;
  }
}
