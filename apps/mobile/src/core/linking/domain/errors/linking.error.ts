export enum LinkingErrorCode {
  INVALID_URL = "INVALID_URL",
  CAN_NOT_OPEN_URL = "CAN_NOT_OPEN_URL",
  UNKNOWN = "UNKNOWN",
}

type TLinkingContext = {
  url?: string;
  cause?: unknown;
};

export class LinkingError extends Error {
  readonly code: LinkingErrorCode;
  readonly context?: TLinkingContext;

  constructor(code: LinkingErrorCode, message?: string, context?: TLinkingContext) {
    super(message ?? code);
    this.name = "LinkingError";
    this.code = code;
    this.context = context;
  }

  static isInstance(error: unknown): error is LinkingError {
    return error instanceof LinkingError;
  }
}
