import { Store } from "core/domain/base/store";
import { action, makeObservable } from "mobx";
import { FollowingStore } from "positions/presentation/stores/following.store";
import { inject, injectable } from "tsyringe";
import { WALLETS_STORE } from "wallets/di/tokens";
import type { WalletsStore } from "wallets/presentation/wallets.store";

@injectable()
export class RootStore extends Store {
  constructor(
    @inject(WALLETS_STORE) public readonly wallets: WalletsStore,
    @inject(FollowingStore) private readonly following: FollowingStore,
  ) {
    super();
    makeObservable(this);
  }

  @action
  async hydrate() {
    await this.wallets.hydrate();
    this.following.hydrate();
  }
}
