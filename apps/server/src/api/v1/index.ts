import { getPosition } from "./positions/id";
import { getPositionFees } from "./positions/fees";

export function handleV1Route(url: URL): Promise<Response> | null {
  const feesMatch = url.pathname.match(/^\/api\/v1\/positions\/(\d+)\/fees$/);
  if (feesMatch) return getPositionFees(feesMatch[1]!);

  const positionMatch = url.pathname.match(/^\/api\/v1\/positions\/(\d+)$/);
  if (positionMatch) return getPosition(positionMatch[1]!);

  return null;
}
