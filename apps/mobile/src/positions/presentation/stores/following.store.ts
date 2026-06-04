import { Store } from "core/domain/base/store";
import { action, makeObservable, observable } from "mobx";
import type { FollowingRepository, TFollowingPosition } from "positions/data/following.repository";
import { FOLLOWING_REPOSITORY } from "positions/di/tokens";
import { inject, singleton } from "tsyringe";
@singleton()
export class FollowingStore extends Store {
  readonly followingIds = observable.set<string>();

  constructor(@inject(FOLLOWING_REPOSITORY) private readonly repo: FollowingRepository) {
    super();
    makeObservable(this);
  }

  get isEmpty() {
    return this.followingIds.size === 0;
  }

  @action
  hydrate(): void {
    this.followingIds.replace(this.repo.getAll());
  }

  isFollowing(position: TFollowingPosition): boolean {
    return this.followingIds.has(this.repo.buildId(position));
  }

  @action
  toggle(position: TFollowingPosition): boolean {
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
