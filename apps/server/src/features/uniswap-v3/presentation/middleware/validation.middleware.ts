import type { ValidationError } from "class-validator";
import type { Context } from "hono";

export const validationHook = (result: { success: boolean; errors?: ValidationError[] }, c: Context) => {
  if (!result.success && result.errors) {
    const formattedErrors = result.errors.map((error) => ({
      field: error.property,
      constraints: error.constraints || {},
    }));

    return c.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: formattedErrors,
      },
      400,
    );
  }
};
