import { Store } from "core/domain/base/store";
import { action, makeObservable, observable } from "mobx";
import type { FollowingPosition, FollowingRepository } from "positions/data/following.repository";
import { FOLLOWING_REPOSITORY } from "positions/di/tokens";
import { inject, singleton } from "tsyringe";
@singleton()
export class FollowingStore extends Store {
  @observable followingIds = new Set<string>();

  constructor(@inject(FOLLOWING_REPOSITORY) private readonly repo: FollowingRepository) {
    super();
    makeObservable(this);
  }

  get isEmpty() {
    return this.followingIds.size === 0;
  }

  hydrate(): void {
    this.followingIds = new Set(this.repo.getAll());
  }

  isFollowing(position: FollowingPosition): boolean {
    return this.followingIds.has(this.repo.buildId(position));
  }

  @action
  toggle(position: FollowingPosition): boolean {
    const id = this.repo.buildId(position);
    const result = this.repo.toggle(position);
    if (result) {
      this.followingIds.add(id);
    } else {
      this.followingIds.delete(id);
    }
    return result;
  }
}
