import { container } from "core/di/container";

import { FollowingRepository } from "../data/following.repository";
import { GatewayPositionsRepository } from "../data/gateway-positions.repository";
import { FOLLOWING_REPOSITORY, POSITIONS_REPOSITORY } from "./tokens";

export function register() {
  container.register(POSITIONS_REPOSITORY, GatewayPositionsRepository);
  container.register(FOLLOWING_REPOSITORY, FollowingRepository);
}
