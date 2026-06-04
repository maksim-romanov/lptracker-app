import type { RedisClient } from "bun";
import { container } from "tsyringe";

import { REDIS } from "../../di/tokens";

interface SWREntry<T> {
  value: T;
  freshUntil: number;
  staleUntil: number;
}

export abstract class BaseCache<T> {
  protected abstract readonly prefix: string;
  protected abstract readonly ttl: number;

  protected readonly freshTtl?: number;
  protected readonly staleTtl?: number;

  private readonly pendingFetches = new Map<string, Promise<unknown>>();

  get redis() {
    return container.resolve<RedisClient>(REDIS);
  }

  protected now(): number {
    const r = this.redis as unknown as { now?: number };
    return typeof r.now === "number" ? r.now : Date.now();
  }

  private key(id: string) {
    return `${this.prefix}:${id}`;
  }

  protected coalesce<R>(key: string, fn: () => Promise<R>): Promise<R> {
    const existing = this.pendingFetches.get(key) as Promise<R> | undefined;
    if (existing) return existing;
    const promise = fn().finally(() => this.pendingFetches.delete(key));
    this.pendingFetches.set(key, promise);
    return promise;
  }

  protected coalesceMany<R>(batchKey: string, fn: () => Promise<R>): Promise<R> {
    return this.coalesce(`batch:${batchKey}`, fn);
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

  protected async getOrSWR(id: string, fetcher: () => Promise<T>): Promise<T> {
    const freshTtl = this.freshTtl;
    const staleTtl = this.staleTtl;
    if (freshTtl == null || staleTtl == null) {
      throw new Error(`${this.constructor.name}: getOrSWR requires freshTtl and staleTtl`);
    }

    const k = this.key(id);
    const raw = await this.redis.get(k);
    const now = this.now();

    if (raw != null) {
      try {
        const entry = JSON.parse(raw) as SWREntry<T>;
        if (now < entry.freshUntil) return entry.value;
        if (now < entry.staleUntil) {
          this.scheduleBackgroundRefresh(id, fetcher);
          return entry.value;
        }
      } catch {
        // fall through
      }
    }

    return this.coalesce(k, async () => {
      const value = await fetcher();
      await this.writeSWR(id, value, freshTtl, staleTtl);
      return value;
    });
  }

  private scheduleBackgroundRefresh(id: string, fetcher: () => Promise<T>): void {
    const k = this.key(id);
    if (this.pendingFetches.has(k)) return;
    void this.coalesce(k, async () => {
      const value = await fetcher();
      await this.writeSWR(id, value, this.freshTtl!, this.staleTtl!);
      return value;
    }).catch(() => {
      // swallow
    });
  }

  private async writeSWR(id: string, value: T, freshTtl: number, staleTtl: number): Promise<void> {
    const k = this.key(id);
    const now = this.now();
    const entry: SWREntry<T> = {
      value,
      freshUntil: now + freshTtl * 1000,
      staleUntil: now + staleTtl * 1000,
    };
    await this.redis.set(k, JSON.stringify(entry));
    await this.redis.expire(k, staleTtl);
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

  protected async getOrSWRMany<Q>(
    queries: Q[],
    keyOf: (q: Q) => string,
    fetcher: (missed: Q[]) => Promise<Map<string, T>>,
  ): Promise<Map<string, T>> {
    const freshTtl = this.freshTtl;
    const staleTtl = this.staleTtl;
    if (freshTtl == null || staleTtl == null) {
      throw new Error(`${this.constructor.name}: getOrSWRMany requires freshTtl and staleTtl`);
    }

    const keys = queries.map(keyOf);
    const raws = await Promise.all(keys.map((id) => this.redis.get(this.key(id))));
    const now = this.now();

    const results = new Map<string, T>();
    const missed: Q[] = [];
    const missedKeys: string[] = [];
    const stale: Q[] = [];
    const staleKeys: string[] = [];

    for (const [i, query] of queries.entries()) {
      const raw = raws[i];
      const key = keys[i];
      if (key === undefined) continue;

      if (raw == null) {
        missed.push(query);
        missedKeys.push(key);
        continue;
      }

      let entry: SWREntry<T> | undefined;
      try {
        entry = JSON.parse(raw) as SWREntry<T>;
      } catch {
        entry = undefined;
      }

      if (entry == null) {
        missed.push(query);
        missedKeys.push(key);
      } else if (now < entry.freshUntil) {
        results.set(key, entry.value);
      } else if (now < entry.staleUntil) {
        results.set(key, entry.value);
        stale.push(query);
        staleKeys.push(key);
      } else {
        missed.push(query);
        missedKeys.push(key);
      }
    }

    if (missed.length > 0) {
      const batchKey = `batch:${[...missedKeys].sort().join("|")}`;
      const fetched = await this.coalesce(batchKey, () => fetcher(missed));
      const writes: Promise<void>[] = [];
      for (const [key, value] of fetched) {
        results.set(key, value);
        writes.push(this.writeSWR(key, value, freshTtl, staleTtl));
      }
      await Promise.all(writes);
    }

    if (stale.length > 0) {
      const refreshKey = `swr-refresh:${[...staleKeys].sort().join("|")}`;
      void this.coalesce(refreshKey, async () => {
        const fetched = await fetcher(stale);
        const writes: Promise<void>[] = [];
        for (const [key, value] of fetched) {
          writes.push(this.writeSWR(key, value, freshTtl, staleTtl));
        }
        await Promise.all(writes);
        return fetched;
      }).catch(() => {});
    }

    return results;
  }
}
