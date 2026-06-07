import "reflect-metadata";

import { CoinGeckoStablesProvider } from "./coingecko-stables.provider";
import { describe, expect, test } from "bun:test";

class Testable extends CoinGeckoStablesProvider {
  public marketIds: string[][] = [];
  public listed: Array<{ id: string; symbol?: string; platforms?: Record<string, string | null> }> = [];
  public failMarkets = false;
  public failList = false;

  protected async fetchStableIds(): Promise<Set<string>> {
    if (this.failMarkets) throw new Error("markets boom");
    return new Set(this.marketIds.flat());
  }

  protected async fetchListedCoinsWithPlatforms() {
    if (this.failList) throw new Error("list boom");
    return this.listed;
  }
}

describe("CoinGeckoStablesProvider", () => {
  test("returns entries scoped to catalog chains with lowercased addresses", async () => {
    const p = new Testable();
    p.marketIds = [["usd-coin"]];
    p.listed = [
      {
        id: "usd-coin",
        symbol: "usdc",
        platforms: {
          ethereum: "0xA0b86991C6218b36C1D19D4A2e9EB0CE3606EB48",
          base: "0x833589FCD6EDB6E08F4C7C32D4F71B54BDA02913",
          "unknown-chain": "0xdeadbeef",
        },
      },
    ];

    const result = await p.resolve();

    expect(result).toEqual([
      { chainId: 1, address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC" },
      { chainId: 8453, address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", symbol: "USDC" },
    ]);
  });

  test("filters out non-stable coins from the listed payload", async () => {
    const p = new Testable();
    p.marketIds = [["usd-coin"]];
    p.listed = [
      { id: "usd-coin", symbol: "usdc", platforms: { ethereum: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" } },
      { id: "ether", symbol: "eth", platforms: { ethereum: "0x0000000000000000000000000000000000000000" } },
    ];

    const result = await p.resolve();
    expect(result.map((r) => r.symbol)).toEqual(["USDC"]);
  });

  test("dedupes when same address appears multiple times", async () => {
    const p = new Testable();
    p.marketIds = [["usd-coin"]];
    p.listed = [
      {
        id: "usd-coin",
        symbol: "usdc",
        platforms: { ethereum: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      },
      {
        id: "usd-coin",
        symbol: "usdc",
        platforms: { ethereum: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      },
    ];

    const result = await p.resolve();
    expect(result.length).toBe(1);
  });

  test("skips malformed addresses", async () => {
    const p = new Testable();
    p.marketIds = [["weird"]];
    p.listed = [{ id: "weird", symbol: "weird", platforms: { ethereum: "not-an-address" } }];
    const result = await p.resolve();
    expect(result).toEqual([]);
  });

  test("propagates failure when markets endpoint throws", async () => {
    const p = new Testable();
    p.failMarkets = true;
    await expect(p.resolve()).rejects.toThrow();
  });
});
