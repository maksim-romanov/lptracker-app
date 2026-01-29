import { container } from "core/di/container";

import { PositionsRepository } from "../data/positions.repository";
import { POSITIONS_REPOSITORY } from "./tokens";

export function register(): void {
  container.register(POSITIONS_REPOSITORY, PositionsRepository);
}
