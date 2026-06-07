import { useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "core/di/container";
import { positionsKeys } from "core/query/keys/positions.keys";
import { FollowPositionUseCase } from "positions/application/usecase/follow-position.usecase";
import { UnfollowPositionUseCase } from "positions/application/usecase/unfollow-position.usecase";
import { FollowingStore } from "positions/presentation/stores/following.store";

export function useFollow(ref: string) {
  const qc = useQueryClient();
  const store = container.resolve(FollowingStore);
  return useMutation({
    mutationFn: async (next: boolean) => {
      if (next) await container.resolve(FollowPositionUseCase).execute(ref);
      else await container.resolve(UnfollowPositionUseCase).execute(ref);
      store.toggle(ref);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: positionsKeys._def }),
  });
}
