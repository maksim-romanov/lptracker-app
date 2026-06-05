import "reflect-metadata";

import { container } from "tsyringe";

import { REDIS } from "../../../di/tokens";
import { FakeRedis } from "../../../shared/cache/fake-redis";
import type { TokenMeta, TokenMetaQuery } from "../domain/types";
import { RpcMetaProvider } from "./rpc-meta.provider";
import { TokenMetaCache } from "./token-meta.cache";
import { beforeEach, describe, expect, test } from "bun:test";

class FakeProvider {
  callCount = 0;
  next = new Map<string, TokenMeta>();
  async execute(_queries: TokenMetaQuery[]): Promise<Map<string, TokenMeta>> {
    this.callCount++;
    return new Map(this.next);
  }
}

let redis: FakeRedis;
let provider: FakeProvider;

beforeEach(() => {
  container.clearInstances();
  redis = new FakeRedis();
  provider = new FakeProvider();
  container.register(REDIS, { useValue: redis });
  container.register(RpcMetaProvider, { useValue: provider as unknown as RpcMetaProvider });
});

const eth: TokenMetaQuery = { chainId: 1, address: "0xeee" };

describe("TokenMetaCache", () => {
  test("caches results — second call does not invoke provider", async () => {
    const cache = container.resolve(TokenMetaCache);
    provider.next.set("1:0xeee", { name: "Token", symbol: "TKN", decimals: 18 });

    await cache.getMeta([eth]);
    provider.next.clear(); // simulate provider going away
    const second = await cache.getMeta([eth]);

    expect(second.get("1:0xeee")?.symbol).toBe("TKN");
    expect(provider.callCount).toBe(1);
  });

  test("only fetches missed entries in mixed batch", async () => {
    const cache = container.resolve(TokenMetaCache);
    provider.next.set("1:0xeee", { name: "ETH", symbol: "ETH", decimals: 18 });
    await cache.getMeta([eth]);

    provider.next.clear();
    provider.next.set("1:0xbtc", { name: "BTC", symbol: "BTC", decimals: 8 });

    const result = await cache.getMeta([eth, { chainId: 1, address: "0xbtc" }]);
    expect(result.get("1:0xeee")?.symbol).toBe("ETH");
    expect(result.get("1:0xbtc")?.symbol).toBe("BTC");
    expect(provider.callCount).toBe(2);
  });
});
