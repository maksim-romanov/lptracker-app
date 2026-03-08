import { container } from "core/di/container";
import { FollowingStore } from "positions/presentation/stores/following.store";

export function useFollowing() {
  return container.resolve(FollowingStore);
}
