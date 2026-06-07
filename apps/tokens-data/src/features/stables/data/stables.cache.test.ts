import "reflect-metadata";

import { container } from "tsyringe";

import { REDIS } from "../../../di/tokens";
import { FakeRedis } from "../../../shared/cache/fake-redis";
import { StablesCache } from "./stables.cache";
import { beforeEach, describe, expect, test } from "bun:test";

let redis: FakeRedis;

beforeEach(() => {
  container.clearInstances();
  redis = new FakeRedis();
  container.register(REDIS, { useValue: redis });
});

describe("StablesCache", () => {
  test("read returns undefined when nothing cached", async () => {
    const cache = container.resolve(StablesCache);
    expect(await cache.read()).toBeUndefined();
  });

  test("write then read returns the cached entries", async () => {
    const cache = container.resolve(StablesCache);
    const entries = [{ chainId: 1, address: "0xa", symbol: "USDC" }];
    await cache.write(entries);
    const cached = await cache.read();
    expect(cached?.entries).toEqual(entries);
  });

  test("ageMs grows with the redis clock", async () => {
    const cache = container.resolve(StablesCache);
    await cache.write([]);
    const before = await cache.read();
    redis.advance(5000);
    expect(cache.ageMs(before!)).toBe(5000);
  });
});
