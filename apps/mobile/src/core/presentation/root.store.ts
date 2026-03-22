import { Store } from "core/domain/base/store";
import { action, makeObservable, observable } from "mobx";
import { inject, singleton } from "tsyringe";
import { WalletsStore } from "wallets/presentation/wallets.store";

@singleton()
export class RootStore extends Store {
  @observable hydrated = false;

  constructor(@inject(WalletsStore) public readonly wallets: WalletsStore) {
    super();
    makeObservable(this);
  }

  @action
  async hydrate() {
    await this.wallets.hydrate();
    this.hydrated = true;
  }
}
