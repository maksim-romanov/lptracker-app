import { container } from "core/di/container";
import { FollowingStore } from "positions/presentation/stores/following.store";

export function useFollowing(positionId: string) {
  const store = container.resolve(FollowingStore);
  const isFollowing = store.isFollowing(positionId);
  const toggle = () => store.toggle(positionId);
  return { isFollowing, toggle };
}
