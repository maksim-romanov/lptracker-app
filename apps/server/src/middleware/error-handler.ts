import type { Context } from "hono";
import type { HTTPResponseError } from "hono/types";

/**
 * Global error handler for Hono
 * Formats all errors to { error: "message" } format
 */
export function errorHandler(err: Error | HTTPResponseError, c: Context) {
  console.error("Error occurred:", err);

  // Handle HTTP errors with status code
  if ("status" in err && typeof err.status === "number") {
    return c.json({ error: err.message || "An error occurred" }, err.status);
  }

  // Handle generic errors
  return c.json({ error: err.message || "Internal server error" }, 500);
}

/**
 * Validation hook for @hono/class-validator
 * Extracts and formats validation errors from class-validator
 */
