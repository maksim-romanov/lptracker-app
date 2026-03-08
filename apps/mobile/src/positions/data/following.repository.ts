import { Repository } from "core/domain/base/repository";
import { createMMKV } from "react-native-mmkv";
import { injectable } from "tsyringe";

const FOLLOWING_KEY = "following:v1";

@injectable()
export class FollowingRepository extends Repository {
  private readonly storage = createMMKV({ id: "following" });

  getAll(): string[] {
    const raw = this.storage.getString(FOLLOWING_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  }

  isFollowing(id: string): boolean {
    return this.getAll().includes(id);
  }

  follow(id: string): void {
    const ids = this.getAll();
    if (!ids.includes(id)) {
      ids.push(id);
      this.storage.set(FOLLOWING_KEY, JSON.stringify(ids));
      this.logger.debug("Position followed", { id });
    }
  }

  unfollow(id: string): void {
    const ids = this.getAll().filter((i) => i !== id);
    this.storage.set(FOLLOWING_KEY, JSON.stringify(ids));
    this.logger.debug("Position unfollowed", { id });
  }

  toggle(id: string): boolean {
    if (this.isFollowing(id)) {
      this.unfollow(id);
      return false;
    }
    this.follow(id);
    return true;
  }
}
