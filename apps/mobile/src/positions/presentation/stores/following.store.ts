import { Store } from "core/domain/base/store";
import { action, makeObservable, observable } from "mobx";
import type { FollowingRepository } from "positions/data/following.repository";
import { FOLLOWING_REPOSITORY } from "positions/di/tokens";
import { inject, singleton } from "tsyringe";

@singleton()
export class FollowingStore extends Store {
  readonly refs = observable.set<string>();

  constructor(@inject(FOLLOWING_REPOSITORY) private readonly repo: FollowingRepository) {
    super();
    makeObservable(this);
  }

  get isEmpty() {
    return this.refs.size === 0;
  }

  @action
  hydrate(): void {
    this.refs.replace(this.repo.getAll());
  }

  isFollowing(ref: string): boolean {
    return this.refs.has(ref);
  }

  @action
  follow(ref: string): void {
    this.repo.follow(ref);
    this.refs.add(ref);
  }

  @action
  unfollow(ref: string): void {
    this.repo.unfollow(ref);
    this.refs.delete(ref);
  }

  @action
  toggle(ref: string): boolean {
    if (this.refs.has(ref)) {
      this.unfollow(ref);
      return false;
    }
    this.follow(ref);
    return true;
  }
}
