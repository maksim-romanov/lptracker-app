import { Store } from "core/domain/base/store";
import { action, makeObservable, observable } from "mobx";
import type { FollowingPosition, FollowingRepository } from "positions/data/following.repository";
import { FOLLOWING_REPOSITORY } from "positions/di/tokens";
import { inject, singleton } from "tsyringe";

@singleton()
export class FollowingStore extends Store {
  @observable.shallow private idsByWallet = new Map<string, ReadonlyArray<string>>();

  constructor(@inject(FOLLOWING_REPOSITORY) private readonly repo: FollowingRepository) {
    super();
    makeObservable(this);
  }

  hydrate(): void {}

  @action
  private load(walletId: string): ReadonlyArray<string> {
    const ids = this.repo.getAll(walletId);
    this.idsByWallet.set(walletId, ids);
    return ids;
  }

  getIds(walletId: string): ReadonlyArray<string> {
    return this.idsByWallet.get(walletId) ?? this.load(walletId);
  }

  isFollowing(walletId: string, position: FollowingPosition): boolean {
    return this.getIds(walletId).includes(this.repo.buildId(position));
  }

  @action
  toggle(walletId: string, position: FollowingPosition): boolean {
    const id = this.repo.buildId(position);
    const current = this.getIds(walletId);
    if (current.includes(id)) {
      this.idsByWallet.set(walletId, current.filter((i) => i !== id));
      this.repo.unfollow(walletId, position);
      return false;
    }
    this.idsByWallet.set(walletId, [...current, id]);
    this.repo.follow(walletId, position);
    return true;
  }
}
