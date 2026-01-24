import { getPositionFees } from "./positions/fees";
import { getPosition } from "./positions/id";
import { getWalletPositions } from "./positions";

export function handleV1Route(url: URL): Promise<Response> | null {
  // Wallet positions route - must be checked before individual position routes
  if (url.pathname === "/api/v1/positions" && url.searchParams.has("owner")) {
    const owner = url.searchParams.get("owner")!;
    return getWalletPositions(owner, url.searchParams);
  }

  const feesMatch = url.pathname.match(/^\/api\/v1\/positions\/(\d+)\/fees$/);
  if (feesMatch) return getPositionFees(feesMatch[1]!);

  const positionMatch = url.pathname.match(/^\/api\/v1\/positions\/(\d+)$/);
  if (positionMatch) return getPosition(positionMatch[1]!);

  return null;
}
