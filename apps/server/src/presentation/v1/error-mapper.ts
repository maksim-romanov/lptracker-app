import type { Context } from "hono";
import { ERROR_CODES, type ErrorCode, type ErrorResponse } from "shared/contracts";
import { DomainError } from "shared/errors/base.error";
import { PositionError, PositionErrorCode } from "uniswap-v3/domain/errors/position.error";

interface ValidationIssue {
  message: string;
  path?: readonly (PropertyKey | { key: PropertyKey })[];
}

interface MappedError {
  status: 400 | 404 | 502 | 504 | 500;
  body: ErrorResponse;
}

const buildBody = (code: ErrorCode, message: string, field: string | null = null): ErrorResponse => ({
  error: { code, message, field },
});

const mapPositionError = (error: PositionError): MappedError => {
  switch (error.code) {
    case PositionErrorCode.POSITION_NOT_FOUND:
      return { status: 404, body: buildBody(ERROR_CODES.POSITION_NOT_FOUND, error.message) };
    case PositionErrorCode.GRAPHQL_ERROR:
      return { status: 502, body: buildBody(ERROR_CODES.UPSTREAM_UNAVAILABLE, error.message) };
    default:
      return { status: 500, body: buildBody(ERROR_CODES.INTERNAL_ERROR, error.message) };
  }
};

const mapDomainError = (error: DomainError): MappedError => {
  if (PositionError.isInstance(error)) return mapPositionError(error);
  return { status: 500, body: buildBody(ERROR_CODES.INTERNAL_ERROR, error.message) };
};

export const mapErrorToHttpResponse = (c: Context, error: unknown) => {
  if (DomainError.isInstance(error)) {
    const { status, body } = mapDomainError(error);
    return c.json(body, status);
  }

  console.error("Unexpected error:", error);
  return c.json(buildBody(ERROR_CODES.INTERNAL_ERROR, "Internal server error"), 500);
};

export const badRequest = (c: Context, code: ErrorCode, message: string, field: string | null = null) =>
  c.json(buildBody(code, message, field), 400);

export const notFound = (c: Context, code: ErrorCode, message: string) => c.json(buildBody(code, message), 404);

type ValidationResult = { success: false; error: readonly ValidationIssue[]; data: unknown } | { success: true; data: unknown };

const formatIssueField = (issue: ValidationIssue): string | null => {
  if (!issue.path || issue.path.length === 0) return null;
  return issue.path
    .map((segment) => (typeof segment === "object" && segment !== null && "key" in segment ? String(segment.key) : String(segment)))
    .join(".");
};

export const validationHook = (result: ValidationResult, c: Context) => {
  if (result.success) return;
  const firstIssue = result.error[0];
  const message = firstIssue?.message ?? "Validation failed";
  const field = firstIssue ? formatIssueField(firstIssue) : null;
  return c.json(buildBody(ERROR_CODES.INVALID_REQUEST, message, field), 400);
};
