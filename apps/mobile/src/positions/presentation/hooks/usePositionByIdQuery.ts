import { useQuery } from "@tanstack/react-query";
import { container } from "core/di/container";
import { queryKeys } from "core/query/keys";
import type { IPositionsRepository } from "positions/data/positions.repository";
import { POSITIONS_REPOSITORY } from "positions/di/tokens";

export function usePositionByIdQuery(id: string) {
  const repo = container.resolve<IPositionsRepository>(POSITIONS_REPOSITORY);

  return useQuery({
    queryKey: queryKeys.positions.byId(id).queryKey,
    queryFn: () => repo.getById(id),
    enabled: !!id,
  });
}
