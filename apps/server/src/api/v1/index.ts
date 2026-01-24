import { getPosition } from "./positions/id";

export function handleV1Route(url: URL): Promise<Response> | null {
  const positionMatch = url.pathname.match(/^\/api\/v1\/positions\/(\d+)$/);
  if (positionMatch) return getPosition(positionMatch[1]!);

  return null;
}
