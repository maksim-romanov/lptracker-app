import * as v from "valibot";

export const errorResponseSchema = v.pipe(
  v.object({
    error: v.object({
      code: v.string(),
      message: v.string(),
      field: v.nullable(v.string()),
      requestId: v.optional(v.string()),
    }),
  }),
  v.metadata({ ref: "ErrorResponse" }),
);

export type ErrorResponse = v.InferOutput<typeof errorResponseSchema>;

export const ERROR_CODES = {
  INVALID_REQUEST: "INVALID_REQUEST",
  INVALID_REF: "INVALID_REF",
  INVALID_FILTER: "INVALID_FILTER",
  POSITION_NOT_FOUND: "POSITION_NOT_FOUND",
  PROTOCOL_UNSUPPORTED: "PROTOCOL_UNSUPPORTED",
  CHAIN_UNSUPPORTED: "CHAIN_UNSUPPORTED",
  UPSTREAM_UNAVAILABLE: "UPSTREAM_UNAVAILABLE",
  UPSTREAM_TIMEOUT: "UPSTREAM_TIMEOUT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
