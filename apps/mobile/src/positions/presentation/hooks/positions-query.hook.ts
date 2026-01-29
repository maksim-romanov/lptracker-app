import { useInfiniteQuery } from "@tanstack/react-query";
import { container } from "core/di/container";
import { queryKeys } from "core/query/keys";

import type { PositionsRepository } from "../../data/positions.repository";
import { POSITIONS_REPOSITORY } from "../../di/tokens";

const LIMIT = 50;

export function usePositionsQuery(walletAddress: string) {
  const repository = container.resolve<PositionsRepository>(POSITIONS_REPOSITORY);

  return useInfiniteQuery({
    queryKey: queryKeys.positions.list(walletAddress).queryKey,
    queryFn: ({ pageParam }) => repository.getPositions({ walletAddress, limit: LIMIT, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => (lastPage?.length === LIMIT ? lastPageParam + LIMIT : undefined),
    select: (data) => data.pages.flat(),
  });
}
