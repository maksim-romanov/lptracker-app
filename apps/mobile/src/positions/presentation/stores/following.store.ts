import { Store } from "core/domain/base/store";
import { action, makeObservable, observable } from "mobx";
import type { FollowingRepository } from "positions/data/following.repository";
import { FOLLOWING_REPOSITORY } from "positions/di/tokens";
import { inject, singleton } from "tsyringe";

@singleton()
export class FollowingStore extends Store {
  @observable followingIds = new Set<string>();

  constructor(@inject(FOLLOWING_REPOSITORY) private readonly repo: FollowingRepository) {
    super();
    makeObservable(this);
  }

  hydrate(): void {
    this.followingIds = new Set(this.repo.getAll());
  }

  isFollowing(id: string): boolean {
    return this.followingIds.has(id);
  }

  @action
  toggle(id: string): boolean {
    const result = this.repo.toggle(id);
    if (result) {
      this.followingIds.add(id);
    } else {
      this.followingIds.delete(id);
    }
    return result;
  }
}
