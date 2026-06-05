import "reflect-metadata";

import { container } from "tsyringe";

import type { TokenPrice, TokenPriceQuery } from "../domain/types";
import { CoinGeckoProvider } from "./providers/coingecko.provider";
import { DefiLlamaProvider } from "./providers/defillama.provider";
import { TokenPriceResolver } from "./token-price.resolver";
import { beforeEach, describe, expect, test } from "bun:test";

class DefiLlamaStub extends DefiLlamaProvider {
  public callCount = 0;
  public shouldThrow = false;
  public nextPrices = new Map<string, TokenPrice>();
  async execute(_queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>> {
    this.callCount++;
    if (this.shouldThrow) throw new Error("defillama down");
    return new Map(this.nextPrices);
  }
}

class CoinGeckoStub extends CoinGeckoProvider {
  public callCount = 0;
  public nextPrices = new Map<string, TokenPrice>();
  async execute(_queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>> {
    this.callCount++;
    return new Map(this.nextPrices);
  }
}

let defillama: DefiLlamaStub;
let coingecko: CoinGeckoStub;

beforeEach(() => {
  container.clearInstances();
  defillama = new DefiLlamaStub();
  coingecko = new CoinGeckoStub();
  container.register(DefiLlamaProvider, { useValue: defillama as unknown as DefiLlamaProvider });
  container.register(CoinGeckoProvider, { useValue: coingecko as unknown as CoinGeckoProvider });
});

describe("TokenPriceResolver", () => {
  test("empty queries returns empty map without calling providers", async () => {
    const r = container.resolve(TokenPriceResolver);
    const result = await r.resolve([]);
    expect(result.size).toBe(0);
    expect(defillama.callCount).toBe(0);
    expect(coingecko.callCount).toBe(0);
  });

  test("returns DefiLlama result without calling CoinGecko", async () => {
    defillama.nextPrices.set("1:0xeee", { priceUSD: 100, confidence: 0.99 });
    coingecko.nextPrices.set("1:0xeee", { priceUSD: 200, confidence: 0.99 });
    const r = container.resolve(TokenPriceResolver);
    const result = await r.resolve([{ chainId: 1, address: "0xeee" }]);
    expect(result.get("1:0xeee")?.priceUSD).toBe(100);
    expect(coingecko.callCount).toBe(0);
  });

  test("falls through to CoinGecko when DefiLlama throws", async () => {
    defillama.shouldThrow = true;
    coingecko.nextPrices.set("1:0xeee", { priceUSD: 200, confidence: 0.99 });
    const r = container.resolve(TokenPriceResolver);
    const result = await r.resolve([{ chainId: 1, address: "0xeee" }]);
    expect(result.get("1:0xeee")?.priceUSD).toBe(200);
    expect(coingecko.callCount).toBe(1);
  });
});
