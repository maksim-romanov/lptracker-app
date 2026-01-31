import type { RedisClient } from "bun";
import { container } from "tsyringe";

import { REDIS } from "../../di/tokens";

export abstract class BaseCache<T> {
  protected abstract readonly prefix: string;
  protected abstract readonly ttl: number;

  get redis() {
    return container.resolve<RedisClient>(REDIS);
  }

  private key(id: string) {
    return `${this.prefix}:${id}`;
  }

  protected async get(id: string): Promise<T | undefined> {
    const raw = await this.redis.get(this.key(id));
    if (raw == null) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }

  protected async set(id: string, value: T): Promise<void> {
    const k = this.key(id);
    await this.redis.set(k, JSON.stringify(value));
    await this.redis.expire(k, this.ttl);
  }

  protected async getMany(ids: string[]): Promise<(T | undefined)[]> {
    const raws = await Promise.all(ids.map((id) => this.redis.get(this.key(id))));
    return raws.map((raw) => {
      if (raw == null) return undefined;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return undefined;
      }
    });
  }

  protected async getOrFetch(id: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.get(id);
    if (cached !== undefined) return cached;

    const value = await fetcher();
    await this.set(id, value);
    return value;
  }

  protected async getOrFetchMany<Q>(
    queries: Q[],
    keyOf: (q: Q) => string,
    fetcher: (missed: Q[]) => Promise<Map<string, T>>,
  ): Promise<Map<string, T>> {
    const keys = queries.map(keyOf);
    const cached = await this.getMany(keys);

    const results = new Map<string, T>();
    const missed: Q[] = [];

    for (let i = 0; i < queries.length; i++) {
      const value = cached[i];
      if (value !== undefined) results.set(keys[i]!, value);
      else missed.push(queries[i]!);
    }

    if (missed.length === 0) return results;

    const fetched = await fetcher(missed);

    const writes: Promise<void>[] = [];
    for (const [key, value] of fetched) {
      results.set(key, value);
      writes.push(this.set(key, value));
    }
    await Promise.all(writes);

    return results;
  }
}
