import type { TPartialMeta } from "positions/data/gateway-positions.repository";

export function partialFailureLabel(failures: TPartialMeta["failures"]): string | null {
  if (failures.length === 0) return null;
  if (failures.length === 1) return "1 source could not be checked";
  return `${failures.length} sources could not be checked`;
}
