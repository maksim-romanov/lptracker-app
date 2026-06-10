import { Repository } from "core/domain/base/repository";
import { createMMKV } from "react-native-mmkv";
import { injectable } from "tsyringe";

export const FOLLOWING_MMKV_KEY = "following:v3";

@injectable()
export class FollowingRepository extends Repository {
  private readonly storage = createMMKV({ id: "following" });

  getAll(): string[] {
    const raw = this.storage.getString(FOLLOWING_MMKV_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
    } catch {
      this.logger.warn("FollowingRepository: malformed payload, resetting");
      this.storage.remove(FOLLOWING_MMKV_KEY);
      return [];
    }
  }

  isFollowing(ref: string): boolean {
    return this.getAll().includes(ref);
  }

  follow(ref: string): void {
    const refs = this.getAll();
    if (!refs.includes(ref)) {
      refs.push(ref);
      this.storage.set(FOLLOWING_MMKV_KEY, JSON.stringify(refs));
    }
  }

  unfollow(ref: string): void {
    const refs = this.getAll().filter((r) => r !== ref);
    this.storage.set(FOLLOWING_MMKV_KEY, JSON.stringify(refs));
  }

  toggle(ref: string): boolean {
    if (this.isFollowing(ref)) {
      this.unfollow(ref);
      return false;
    }
    this.follow(ref);
    return true;
  }

  prune(validRefs: ReadonlySet<string>): string[] {
    const refs = this.getAll();
    const kept = refs.filter((r) => validRefs.has(r));
    if (kept.length === refs.length) return kept;
    this.storage.set(FOLLOWING_MMKV_KEY, JSON.stringify(kept));
    return kept;
  }
}
