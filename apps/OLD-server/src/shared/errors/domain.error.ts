export abstract class DomainError<TCode extends string = string> extends Error {
	constructor(
		public readonly code: TCode,
		message: string,
		public readonly context: Record<string, unknown> = {},
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}

	static isInstance(error: unknown): error is DomainError {
		return error instanceof DomainError;
	}
}
