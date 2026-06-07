import { useQuery } from "@tanstack/react-query";
import { container } from "core/di/container";
import { positionsKeys } from "core/query/keys/positions.keys";
import { GatewayPositionsRepository } from "positions/data/gateway-positions.repository";

export function usePositionByRefQuery(ref: string) {
  const repo = container.resolve(GatewayPositionsRepository);
  return useQuery({
    queryKey: positionsKeys.byRef(ref).queryKey,
    queryFn: () => repo.getByRef(ref),
    enabled: ref.length > 0,
  });
}
