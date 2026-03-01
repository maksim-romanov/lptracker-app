import { inject, injectable } from "tsyringe";

import { action, makeObservable } from "mobx";
import { WALLETS_STORE } from "wallets/di/tokens";
import { WalletsStore } from "wallets/presentation/wallets.store";

@injectable()
export class RootStore {
  constructor(@inject(WALLETS_STORE) public readonly wallets: WalletsStore) {
    makeObservable(this);
  }

  @action
  hydrate(): void {
    this.wallets.hydrate();
  }
}
