import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import type { Context, Next } from "hono";

/**
 * Custom validation middleware for Hono
 * Uses class-validator and class-transformer to validate request data
 */
export function classValidator<T extends object>(target: "query" | "param" | "body", dtoClass: new () => T) {
  return async (c: Context, next: Next) => {
    // Get the raw data based on target
    let rawData: any;
    if (target === "query") {
      // Convert URLSearchParams to plain object
      rawData = {};
      const searchParams = new URL(c.req.url).searchParams;
      for (const [key, value] of searchParams.entries()) {
        rawData[key] = value;
      }
    } else if (target === "param") {
      rawData = c.req.param();
    } else {
      rawData = await c.req.json();
    }

    // Transform plain object to class instance with transformations
    const dtoInstance = plainToInstance(dtoClass, rawData, {
      enableImplicitConversion: true,
      exposeDefaultValues: true,
    });

    // Validate the instance
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      // Extract first validation error message
      const firstError = errors[0];
      if (firstError?.constraints) {
        const message = Object.values(firstError.constraints)[0];
        return c.json({ error: message }, 400);
      }
      return c.json({ error: "Validation failed" }, 400);
    }

    // Store validated data in context
    c.set(`validated_${target}`, dtoInstance);

    await next();
  };
}

/**
 * Helper to get validated data from context
 */
export function getValidated<T>(c: Context, target: "query" | "param" | "body"): T {
  return c.get(`validated_${target}`) as T;
}
