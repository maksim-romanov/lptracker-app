import "reflect-metadata";

import { container } from "tsyringe";

import { REDIS } from "../../../di/tokens";
import { FakeRedis } from "../../../shared/cache/fake-redis";
import type { TokenPrice, TokenPriceQuery } from "../domain/types";
import { TokenPriceCache } from "./token-price.cache";
import { TokenPriceResolver } from "./token-price.resolver";
import { beforeEach, describe, expect, test } from "bun:test";

class FakeResolver {
  callCount = 0;
  nextPrices = new Map<string, TokenPrice>();
  async resolve(_queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>> {
    this.callCount++;
    return new Map(this.nextPrices);
  }
}

let redis: FakeRedis;
let resolver: FakeResolver;

beforeEach(() => {
  container.clearInstances();
  redis = new FakeRedis();
  resolver = new FakeResolver();
  container.register(REDIS, { useValue: redis });
  container.register(TokenPriceResolver, { useValue: resolver as unknown as TokenPriceResolver });
});

const eth: TokenPriceQuery = { chainId: 1, address: "0xeee" };

describe("TokenPriceCache", () => {
  test("concurrent batch requests dedupe", async () => {
    const cache = container.resolve(TokenPriceCache);
    resolver.nextPrices.set("1:0xeee", { priceUSD: 100, confidence: 0.99 });

    const [a, b] = await Promise.all([cache.getPrices([eth]), cache.getPrices([eth])]);
    expect(a.get("1:0xeee")?.priceUSD).toBe(100);
    expect(b.get("1:0xeee")?.priceUSD).toBe(100);
    expect(resolver.callCount).toBe(1);
  });

  test("second call within fresh window served from cache", async () => {
    const cache = container.resolve(TokenPriceCache);
    resolver.nextPrices.set("1:0xeee", { priceUSD: 100, confidence: 0.99 });
    await cache.getPrices([eth]);

    resolver.nextPrices.set("1:0xeee", { priceUSD: 200, confidence: 0.99 });
    const r = await cache.getPrices([eth]);
    expect(r.get("1:0xeee")?.priceUSD).toBe(100);
    expect(resolver.callCount).toBe(1);
  });
});
