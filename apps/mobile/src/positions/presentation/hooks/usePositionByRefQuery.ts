import { useQuery } from "@tanstack/react-query";
import { container } from "core/di/container";
import { positionsKeys } from "core/query/keys/positions.keys";
import type { IPositionsRepository } from "positions/data/positions.repository";
import { POSITIONS_REPOSITORY } from "positions/di/tokens";

export function usePositionByRefQuery(ref: string) {
  const repo = container.resolve<IPositionsRepository>(POSITIONS_REPOSITORY);
  return useQuery({
    queryKey: positionsKeys.byRef(ref).queryKey,
    queryFn: () => repo.getByRef(ref),
    enabled: ref.length > 0,
  });
}
