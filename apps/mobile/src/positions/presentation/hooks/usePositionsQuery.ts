import { useQuery } from "@tanstack/react-query";
import { container } from "core/di/container";
import { positionsKeys } from "core/query/keys/positions.keys";
import { GatewayPositionsRepository, type TPositionsListParams } from "positions/data/gateway-positions.repository";

export function usePositionsQuery(params: TPositionsListParams) {
  const repo = container.resolve(GatewayPositionsRepository);
  return useQuery({
    queryKey: positionsKeys.list(params).queryKey,
    queryFn: () => repo.list(params),
    enabled: params.wallets.length > 0,
    select: (data) => ({
      positions: data.data,
      tokens: data.tokens,
      hasPartial: data.meta.partial !== undefined,
    }),
  });
}
