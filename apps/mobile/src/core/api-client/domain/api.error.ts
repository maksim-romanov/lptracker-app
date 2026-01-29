type TApiContext = {
  statusCode: number;
  endpoint?: string;
  method?: string;
  data?: unknown;
};

export class ApiError extends Error {
  readonly code: string;
  readonly context: TApiContext;

  constructor(message: string, context: TApiContext, code = "API_ERROR") {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.context = context;
  }

  get statusCode(): number {
    return this.context.statusCode;
  }

  is(statusCode: number): boolean {
    return this.statusCode === statusCode;
  }

  static isUnauthorized(error: unknown): error is ApiError {
    return error instanceof ApiError && error.statusCode === 401;
  }

  static isInstance(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
}
