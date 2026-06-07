import { useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "core/di/container";
import { positionsKeys } from "core/query/keys/positions.keys";
import { FollowingStore } from "positions/presentation/stores/following.store";

export function useFollow(ref: string) {
  const qc = useQueryClient();
  const store = container.resolve(FollowingStore);
  return useMutation({
    mutationFn: async (next: boolean) => {
      if (next) store.follow(ref);
      else store.unfollow(ref);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: positionsKeys._def }),
  });
}
