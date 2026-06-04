import { Repository } from "core/domain/base/repository";
import { createMMKV } from "react-native-mmkv";
import { injectable } from "tsyringe";

const FOLLOWING_KEY = "following:v2";

export type TFollowingPosition = {
  protocol: string;
  chainId: number;
  id: string;
};

@injectable()
export class FollowingRepository extends Repository {
  private readonly storage = createMMKV({ id: "following" });

  buildId(position: TFollowingPosition): string {
    return `${position.protocol}:${position.chainId}:${position.id}`;
  }

  getAll(): string[] {
    const raw = this.storage.getString(FOLLOWING_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  }

  isFollowing(position: TFollowingPosition): boolean {
    return this.getAll().includes(this.buildId(position));
  }

  follow(position: TFollowingPosition): void {
    const id = this.buildId(position);
    const ids = this.getAll();
    if (!ids.includes(id)) {
      ids.push(id);
      this.storage.set(FOLLOWING_KEY, JSON.stringify(ids));
      this.logger.debug("Position followed", { id });
    }
  }

  unfollow(position: TFollowingPosition): void {
    const id = this.buildId(position);
    const ids = this.getAll().filter((i) => i !== id);
    this.storage.set(FOLLOWING_KEY, JSON.stringify(ids));
    this.logger.debug("Position unfollowed", { id });
  }

  toggle(position: TFollowingPosition): boolean {
    if (this.isFollowing(position)) {
      this.unfollow(position);
      return false;
    }
    this.follow(position);
    return true;
  }
}
