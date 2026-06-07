import { useInfiniteQuery } from "@tanstack/react-query";
import { container } from "core/di/container";
import { positionsKeys } from "core/query/keys/positions.keys";
import { GatewayPositionsRepository, type TPositionsListParams, type TPositionsListResult } from "positions/data/gateway-positions.repository";

const mergeTokensMaps = (results: ReadonlyArray<TPositionsListResult>) => Object.assign({}, ...results.map((r) => r.tokens));

export function usePositionsQuery(params: Omit<TPositionsListParams, "cursor">) {
  const repo = container.resolve(GatewayPositionsRepository);
  return useInfiniteQuery({
    queryKey: positionsKeys.list(params).queryKey,
    queryFn: ({ pageParam }) => repo.list({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.page?.nextCursor,
    enabled: params.wallets.length > 0,
    select: (data) => ({
      positions: data.pages.flatMap((p) => p.data),
      tokens: mergeTokensMaps(data.pages),
      hasPartial: data.pages.some((p) => p.meta.partial !== undefined),
    }),
  });
}
