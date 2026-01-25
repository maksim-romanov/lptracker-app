import type { Context } from "hono";

import { PositionError, PositionErrorCode } from "../../domain/errors/position.error";

export function mapToHttpResponse(c: Context, error: unknown) {
  if (PositionError.isInstance(error)) {
    const response = {
      error: error.message,
      code: error.code,
      ...(Object.keys(error.context).length > 0 && { details: error.context }),
    };

    switch (error.code) {
      case PositionErrorCode.POSITION_NOT_FOUND:
        return c.json(response, 404);
      default:
        return c.json(response, 500);
    }
  }

  console.error("Unexpected error:", error);
  return c.json(
    {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    },
    500,
  );
}
