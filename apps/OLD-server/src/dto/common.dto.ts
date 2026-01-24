import { Transform } from "class-transformer";
import { Min, registerDecorator } from "class-validator";

/**
 * Transformer to convert string "true"/"false" to boolean
 */
export function ToBoolean() {
  return Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    if (typeof value === "boolean") return value;
    return undefined;
  });
}

/**
 * Transformer to convert string to number
 */
export function ToNumber() {
  return Transform(({ value }) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseInt(value, 10);
      return Number.isNaN(parsed) ? value : parsed;
    }
    return value;
  });
}

/**
 * Decorator to clamp pagination values between min and max
 * Applies after conversion to number
 */
export function ClampPagination(min: number, max: number) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: "clampPagination",
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} must be between ${min} and ${max}`,
      },
      validator: {
        validate(value: any) {
          if (typeof value !== "number") return true; // Let other validators handle type
          return value >= min && value <= max;
        },
      },
    });

    // Add transformer to clamp the value
    Transform(({ value }) => {
      if (typeof value === "number") {
        return Math.min(Math.max(min, value), max);
      }
      return value;
    })(object, propertyName);
  };
}

/**
 * Decorator to ensure minimum value and clamp if below
 */
export function MinValue(min: number) {
  return (object: object, propertyName: string) => {
    // Add validator
    Min(min)(object, propertyName);

    // Add transformer to clamp the value
    Transform(({ value }) => {
      if (typeof value === "number") {
        return Math.max(min, value);
      }
      return value;
    })(object, propertyName);
  };
}

/**
 * Common enum types
 */
export enum OrderDirection {
  ASC = "asc",
  DESC = "desc",
}

export enum DetailLevel {
  BASIC = "basic",
  FULL = "full",
}
