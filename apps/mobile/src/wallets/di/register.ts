import { container } from "core/di/container";

import { WalletsRepository } from "../data/wallets.repository";
import { WalletsStore } from "../presentation/wallets.store";
import { WALLETS_REPOSITORY, WALLETS_STORE } from "./tokens";

export function register() {
  container.register(WALLETS_REPOSITORY, WalletsRepository);
  container.registerSingleton(WALLETS_STORE, WalletsStore);
}
