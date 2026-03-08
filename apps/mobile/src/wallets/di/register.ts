import { container } from "core/di/container";

import { WalletsRepository } from "../data/wallets.repository";
import { WALLETS_REPOSITORY } from "./tokens";

export function register() {
  container.register(WALLETS_REPOSITORY, WalletsRepository);
}
