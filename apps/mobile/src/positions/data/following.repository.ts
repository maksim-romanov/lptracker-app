import { Repository } from "core/domain/base/repository";
import type { Position } from "positions/domain/position";
import { createMMKV } from "react-native-mmkv";
import { injectable } from "tsyringe";

export type FollowingPosition = Pick<Position, "protocol" | "chainId"> & { data: Pick<Position["data"], "id"> };

@injectable()
export class FollowingRepository extends Repository {
  private readonly storage = createMMKV({ id: "following" });

  private storageKey(walletId: string): string {
    return `following:v3:${walletId}`;
  }

  buildId(position: FollowingPosition): string {
    return `${position.protocol}:${position.chainId}:${position.data.id}`;
  }

  parseId(id: string): { protocol: string; chainId: number; id: string } {
    const [protocol, chainId, positionId] = id.split(":");
    return { protocol, chainId: Number(chainId), id: positionId };
  }

  getAll(walletId: string): string[] {
    const raw = this.storage.getString(this.storageKey(walletId));
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  }

  isFollowing(walletId: string, position: FollowingPosition): boolean {
    return this.getAll(walletId).includes(this.buildId(position));
  }

  follow(walletId: string, position: FollowingPosition): void {
    const id = this.buildId(position);
    const ids = this.getAll(walletId);
    if (!ids.includes(id)) {
      ids.push(id);
      this.storage.set(this.storageKey(walletId), JSON.stringify(ids));
      this.logger.debug("Position followed", { id, walletId });
    }
  }

  unfollow(walletId: string, position: FollowingPosition): void {
    const id = this.buildId(position);
    const ids = this.getAll(walletId).filter((i) => i !== id);
    this.storage.set(this.storageKey(walletId), JSON.stringify(ids));
    this.logger.debug("Position unfollowed", { id, walletId });
  }

  toggle(walletId: string, position: FollowingPosition): boolean {
    if (this.isFollowing(walletId, position)) {
      this.unfollow(walletId, position);
      return false;
    }
    this.follow(walletId, position);
    return true;
  }
}
