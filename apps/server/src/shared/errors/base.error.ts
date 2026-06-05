export type DomainErrorOpts<TContext extends Record<string, unknown> = Record<string, unknown>> = {
  message?: string;
  error?: unknown;
  context?: TContext;
};

export abstract class DomainError<
  TCode extends string = string,
  TContext extends Record<string, unknown> = Record<string, unknown>,
> extends Error {
  public readonly code: TCode;
  public readonly context?: TContext;

  constructor(code: TCode, message: string, context?: TContext) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  static isInstance(error: unknown): error is DomainError {
    return error instanceof DomainError;
  }

  protected static create<T extends DomainError>(this: new (...args: never[]) => T, code: T["code"], opts?: DomainErrorOpts): T {
    const message = opts?.message ?? (opts?.error instanceof Error ? opts.error.message : undefined);
    type Ctor = new (code: T["code"], message?: string, context?: Record<string, unknown>) => T;
    // biome-ignore lint/complexity/noThisInStatic: `this` is the late-bound subclass — required so static factories construct the right subclass.
    const Ctor = this as Ctor;
    return new Ctor(code, message, opts?.context);
  }
}
