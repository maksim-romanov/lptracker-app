import { container } from "core/di/container";

import { FollowingRepository } from "../data/following.repository";
import { FOLLOWING_REPOSITORY } from "./tokens";

export function register() {
  container.register(FOLLOWING_REPOSITORY, FollowingRepository);
}
