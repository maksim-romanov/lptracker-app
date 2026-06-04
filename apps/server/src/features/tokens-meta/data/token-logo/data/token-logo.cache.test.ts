import "reflect-metadata";

import { container } from "tsyringe";

import { REDIS } from "../../../../../di/tokens";
import { FakeRedis } from "../../../../../shared/cache/fake-redis";
import { TokenLogoCache } from "./token-logo.cache";
import { TokenLogoResolver } from "./token-logo.resolver";
import { beforeEach, describe, expect, test } from "bun:test";

class FakeResolver {
  callCount = 0;
  next: string | null = "https://example.com/x.png";
  async resolve(_chainId: number, _address: string): Promise<string | null> {
    this.callCount++;
    return this.next;
  }
  async resolveMany() {
    return new Map<string, string | null>();
  }
}

let redis: FakeRedis;
let resolver: FakeResolver;

beforeEach(() => {
  container.clearInstances();
  redis = new FakeRedis();
  resolver = new FakeResolver();
  container.register(REDIS, { useValue: redis });
  container.register(TokenLogoResolver, { useValue: resolver as unknown as TokenLogoResolver });
});

describe("TokenLogoCache", () => {
  test("concurrent calls for same token share one resolver invocation", async () => {
    const cache = container.resolve(TokenLogoCache);
    const results = await Promise.all([cache.resolve(1, "0xAAA"), cache.resolve(1, "0xAAA"), cache.resolve(1, "0xAAA")]);
    expect(results.every((r) => r === "https://example.com/x.png")).toBe(true);
    expect(resolver.callCount).toBe(1);
  });

  test("second call serves from cache", async () => {
    const cache = container.resolve(TokenLogoCache);
    await cache.resolve(1, "0xAAA");
    resolver.next = "https://different.png";
    expect(await cache.resolve(1, "0xAAA")).toBe("https://example.com/x.png");
    expect(resolver.callCount).toBe(1);
  });
});
