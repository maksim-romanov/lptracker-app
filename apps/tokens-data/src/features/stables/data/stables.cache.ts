import { BaseCache } from "shared/cache/base-cache";
import { singleton } from "tsyringe";

import type { TStableEntry } from "../domain/stables-set";

type TCachedStables = {
  fetchedAt: number;
  entries: TStableEntry[];
};

const CACHE_KEY = "v1";

@singleton()
export class StablesCache extends BaseCache<TCachedStables> {
  protected readonly prefix = "stables";
  protected readonly ttl = 24 * 60 * 60;

  async read(): Promise<TCachedStables | undefined> {
    return this.get(CACHE_KEY);
  }

  async write(entries: TStableEntry[]): Promise<void> {
    await this.set(CACHE_KEY, { fetchedAt: this.now(), entries });
  }

  ageMs(cached: TCachedStables): number {
    return this.now() - cached.fetchedAt;
  }
}
