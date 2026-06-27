import type { Context } from "hono";

import { ErrorBanner } from "../views/fragments/ErrorBanner";

// Mirrors v1 validationHook shape but renders an ErrorBanner HTML fragment instead of JSON.
interface ValidationIssue {
  message: string;
  path?: readonly (PropertyKey | { key: PropertyKey })[];
}

type ValidationResult = { success: false; error: readonly ValidationIssue[]; data: unknown } | { success: true; data: unknown };

export const webValidationHook = (result: ValidationResult, c: Context) => {
  if (result.success) return;
  const message = result.error[0]?.message ?? "Invalid request";
  // Render through ErrorBanner so hono/jsx auto-escapes the message — prevents reflected XSS.
  return c.html(<ErrorBanner message={message} />, 400);
};
