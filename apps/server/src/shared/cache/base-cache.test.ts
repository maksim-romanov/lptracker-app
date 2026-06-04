import "reflect-metadata";

import { container } from "tsyringe";

import { REDIS } from "../../di/tokens";
import { BaseCache } from "./base-cache";
import { FakeRedis } from "./fake-redis";
import { beforeEach, describe, expect, test } from "bun:test";

class TestCache extends BaseCache<number> {
  protected readonly prefix = "t";
  protected readonly ttl = 60;
  protected readonly freshTtl = 10;
  protected readonly staleTtl = 60;

  public callCount = 0;
  public nextValue = 1;
  public lastMissed: string[] = [];

  fetch(): Promise<number> {
    this.callCount++;
    return Promise.resolve(this.nextValue);
  }

  swr(id: string) {
    return this.getOrSWR(id, () => this.fetch());
  }

  swrMany(ids: string[]) {
    return this.getOrSWRMany(
      ids,
      (id) => id,
      (missed) => {
        this.callCount++;
        this.lastMissed = [...missed];
        const out = new Map<string, number>();
        for (const id of missed) out.set(id, this.nextValue);
        return Promise.resolve(out);
      },
    );
  }
}

let redis: FakeRedis;

beforeEach(() => {
  container.clearInstances();
  redis = new FakeRedis();
  container.register(REDIS, { useValue: redis });
});

describe("BaseCache.getOrSWR", () => {
  test("first call fetches and caches", async () => {
    const c = new TestCache();
    expect(await c.swr("k")).toBe(1);
    expect(c.callCount).toBe(1);
  });

  test("within fresh window returns cached without calling fetcher", async () => {
    const c = new TestCache();
    await c.swr("k");
    c.nextValue = 2;
    expect(await c.swr("k")).toBe(1);
    expect(c.callCount).toBe(1);
  });

  test("within stale window returns cached and triggers background refresh", async () => {
    const c = new TestCache();
    await c.swr("k");
    c.nextValue = 2;
    redis.advance(11_000);

    expect(await c.swr("k")).toBe(1);
    await new Promise((r) => setImmediate(r));
    expect(c.callCount).toBe(2);
    expect(await c.swr("k")).toBe(2);
  });

  test("past stale window blocks on fresh fetch", async () => {
    const c = new TestCache();
    await c.swr("k");
    c.nextValue = 2;
    redis.advance(61_000);

    expect(await c.swr("k")).toBe(2);
    expect(c.callCount).toBe(2);
  });

  test("background refresh failure does not throw to caller", async () => {
    const c = new TestCache();
    await c.swr("k");
    redis.advance(11_000);
    c.fetch = () => Promise.reject(new Error("upstream"));
    expect(await c.swr("k")).toBe(1);
    await new Promise((r) => setImmediate(r));
  });
});

describe("BaseCache.getOrSWRMany", () => {
  test("all fresh: returns cached, fetcher not called", async () => {
    const c = new TestCache();
    await c.swrMany(["a", "b"]);
    expect(c.callCount).toBe(1);
    expect(c.lastMissed).toEqual(["a", "b"]);

    c.nextValue = 99;
    const result = await c.swrMany(["a", "b"]);
    expect(result.get("a")).toBe(1);
    expect(result.get("b")).toBe(1);
    expect(c.callCount).toBe(1);
  });

  test("mix of miss + fresh: fetcher called only for missed", async () => {
    const c = new TestCache();
    await c.swrMany(["a"]);
    expect(c.callCount).toBe(1);

    c.nextValue = 7;
    const result = await c.swrMany(["a", "b"]);
    expect(result.get("a")).toBe(1);
    expect(result.get("b")).toBe(7);
    expect(c.callCount).toBe(2);
    expect(c.lastMissed).toEqual(["b"]);
  });

  test("stale entry: returns cached, schedules background refresh, subsequent call sees new value", async () => {
    const c = new TestCache();
    await c.swrMany(["a"]);
    expect(c.callCount).toBe(1);

    c.nextValue = 2;
    redis.advance(11_000);

    const stale = await c.swrMany(["a"]);
    expect(stale.get("a")).toBe(1);

    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setImmediate(r));
    expect(c.callCount).toBe(2);

    const fresh = await c.swrMany(["a"]);
    expect(fresh.get("a")).toBe(2);
    expect(c.callCount).toBe(2);
  });
});

describe("BaseCache coalescing", () => {
  test("concurrent SWR calls for same key share one fetcher invocation", async () => {
    const c = new TestCache();
    let resolveFetch: ((v: number) => void) | null = null;
    c.fetch = () =>
      new Promise<number>((resolve) => {
        resolveFetch = resolve;
      });

    const p1 = c.swr("k");
    const p2 = c.swr("k");

    // Flush microtasks until the fetcher has been invoked and resolveFetch is wired.
    while (resolveFetch === null) {
      await new Promise((r) => setImmediate(r));
    }
    (resolveFetch as (v: number) => void)(42);

    expect(await p1).toBe(42);
    expect(await p2).toBe(42);
  });
});
