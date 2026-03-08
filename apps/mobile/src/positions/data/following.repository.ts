import { Repository } from "core/domain/base/repository";
import type { Position } from "positions/domain/position";
import { createMMKV } from "react-native-mmkv";
import { injectable } from "tsyringe";

const FOLLOWING_KEY = "following:v2";

export type FollowingPosition = Pick<Position, "protocol" | "chainId"> & { data: Pick<Position["data"], "id"> };

@injectable()
export class FollowingRepository extends Repository {
  private readonly storage = createMMKV({ id: "following" });

  buildId(position: FollowingPosition): string {
    return `${position.protocol}:${position.chainId}:${position.data.id}`;
  }

  getAll(): string[] {
    const raw = this.storage.getString(FOLLOWING_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  }

  isFollowing(position: FollowingPosition): boolean {
    return this.getAll().includes(this.buildId(position));
  }

  follow(position: FollowingPosition): void {
    const id = this.buildId(position);
    const ids = this.getAll();
    if (!ids.includes(id)) {
      ids.push(id);
      this.storage.set(FOLLOWING_KEY, JSON.stringify(ids));
      this.logger.debug("Position followed", { id });
    }
  }

  unfollow(position: FollowingPosition): void {
    const id = this.buildId(position);
    const ids = this.getAll().filter((i) => i !== id);
    this.storage.set(FOLLOWING_KEY, JSON.stringify(ids));
    this.logger.debug("Position unfollowed", { id });
  }

  toggle(position: FollowingPosition): boolean {
    if (this.isFollowing(position)) {
      this.unfollow(position);
      return false;
    }
    this.follow(position);
    return true;
  }
}
