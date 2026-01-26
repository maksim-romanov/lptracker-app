import type { Context } from "hono";

export function mapToHttpResponse(c: Context, error: unknown) {
  console.error("Unexpected error:", error);

  return c.json(
    {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    },
    500,
  );
}
