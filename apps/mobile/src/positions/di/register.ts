import { container } from "core/di/container";

import { FollowingRepository } from "../data/following.repository";
import { MockPositionsRepository } from "../data/mock-positions.repository";
import { FOLLOWING_REPOSITORY, POSITIONS_REPOSITORY } from "./tokens";

export function register() {
  // Mock-backed placeholder; will be swapped for GatewayPositionsRepository
  // once the gateway response is mapped into the TPosition shape.
  container.register(POSITIONS_REPOSITORY, MockPositionsRepository);
  container.register(FOLLOWING_REPOSITORY, FollowingRepository);
}
