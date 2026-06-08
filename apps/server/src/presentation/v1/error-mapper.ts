import { getLogger } from "@mars-909/logger";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ERROR_CODES, type ErrorCode, type ErrorResponse } from "shared/contracts";
import { DomainError } from "shared/errors/base.error";

import { protocolRegistry } from "../../app/protocols/registry";

const logger = getLogger(["server", "http"]);

interface ValidationIssue {
  message: string;
  path?: readonly (PropertyKey | { key: PropertyKey })[];
}

interface MappedHttpError {
  status: number;
  body: ErrorResponse;
}

const buildBody = (code: ErrorCode | string, message: string, field: string | null = null): ErrorResponse => ({
  error: { code, message, field },
});

export const mapDomainErrorToResponse = (error: DomainError): MappedHttpError => {
  for (const entry of protocolRegistry.all()) {
    const mapped = entry.mapError?.(error);
    if (mapped) {
      return {
        status: mapped.status,
        body: buildBody(mapped.code, mapped.message, mapped.field ?? null),
      };
    }
  }
  return { status: 500, body: buildBody(ERROR_CODES.INTERNAL_ERROR, error.message) };
};

export const mapErrorToHttpResponse = (c: Context, error: unknown) => {
  if (DomainError.isInstance(error)) {
    const { status, body } = mapDomainErrorToResponse(error);
    return c.json(body, status as ContentfulStatusCode);
  }

  logger.error("unhandled error", { error });
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
