import { Store } from "core/domain/base/store";
import type { FollowingPosition, FollowingRepository } from "positions/data/following.repository";
import { FOLLOWING_REPOSITORY } from "positions/di/tokens";
import { inject, singleton } from "tsyringe";

@singleton()
export class FollowingStore extends Store {
  constructor(@inject(FOLLOWING_REPOSITORY) private readonly repo: FollowingRepository) {
    super();
  }

  hydrate(): void {}

  getIds(walletId: string): string[] {
    return this.repo.getAll(walletId);
  }

  isFollowing(walletId: string, position: FollowingPosition): boolean {
    return this.repo.getAll(walletId).includes(this.repo.buildId(position));
  }

  toggle(walletId: string, position: FollowingPosition): boolean {
    return this.repo.toggle(walletId, position);
  }
}
