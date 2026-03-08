import { useState } from "react";

import { container } from "core/di/container";
import type { FollowingRepository } from "positions/data/following.repository";
import { FOLLOWING_REPOSITORY } from "positions/di/tokens";

export function useFollowing(positionId: string) {
  const repository = container.resolve<FollowingRepository>(FOLLOWING_REPOSITORY);
  const [isFollowing, setIsFollowing] = useState(() => repository.isFollowing(positionId));

  const toggle = () => {
    const result = repository.toggle(positionId);
    setIsFollowing(result);
  };

  return { isFollowing, toggle };
}
