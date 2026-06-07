import { container } from "core/di/container";

import { FollowingRepository } from "../data/following.repository";
import { PositionViewPrefsRepository } from "../data/position-view-prefs.repository";
import { FOLLOWING_REPOSITORY, POSITION_VIEW_PREFS_REPOSITORY } from "./tokens";

export function register() {
  container.register(FOLLOWING_REPOSITORY, FollowingRepository);
  container.register(POSITION_VIEW_PREFS_REPOSITORY, PositionViewPrefsRepository);
}
