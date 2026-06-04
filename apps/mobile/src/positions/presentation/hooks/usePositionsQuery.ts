import { useQuery } from "@tanstack/react-query";
import { container } from "core/di/container";
import { queryKeys } from "core/query/keys";
import type { IPositionsRepository } from "positions/data/positions.repository";
import { POSITIONS_REPOSITORY } from "positions/di/tokens";

export function usePositionsQuery() {
  const repo = container.resolve<IPositionsRepository>(POSITIONS_REPOSITORY);

  return useQuery({
    queryKey: queryKeys.positions.list("").queryKey,
    queryFn: () => repo.getPositions({ walletAddress: "" }),
  });
}
