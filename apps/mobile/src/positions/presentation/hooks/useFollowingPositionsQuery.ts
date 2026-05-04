import { useQueries } from "@tanstack/react-query";
import { container } from "core/di/container";
import { queryKeys } from "core/query/keys";
import type { Position } from "positions/domain/position";

import type { FollowingRepository } from "../../data/following.repository";
import type { PositionsRepository } from "../../data/positions.repository";
import { FOLLOWING_REPOSITORY, POSITIONS_REPOSITORY } from "../../di/tokens";

export function useFollowingPositionsQuery(ids: ReadonlyArray<string>) {
  const positionsRepo = container.resolve<PositionsRepository>(POSITIONS_REPOSITORY);
  const followingRepo = container.resolve<FollowingRepository>(FOLLOWING_REPOSITORY);

  return useQueries({
    queries: ids.map((id) => {
      const parsed = followingRepo.parseId(id);

      return {
        queryKey: queryKeys.positions.detail(parsed.chainId, parsed.id).queryKey,
        queryFn: () => positionsRepo.getPosition(parsed.chainId as Position["chainId"], parsed.id),
        refetchInterval: 1000 * 60 * 5,
      };
    }),
    combine: (results) => ({
      data: results.filter((r) => r.data != null).map((r) => r.data),
      isLoading: results.some((r) => r.isLoading),
      isPending: results.some((r) => r.isPending),
      refetch: () => Promise.all(results.map((r) => r.refetch())),
    }),
  });
}
