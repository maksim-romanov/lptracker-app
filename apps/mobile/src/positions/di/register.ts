import { container } from "core/di/container";

import { FollowingRepository } from "../data/following.repository";
import { PositionsRepository } from "../data/positions.repository";
import { FOLLOWING_REPOSITORY, POSITIONS_REPOSITORY } from "./tokens";

export function register() {
  container.register(POSITIONS_REPOSITORY, PositionsRepository);
  container.register(FOLLOWING_REPOSITORY, FollowingRepository);
}
