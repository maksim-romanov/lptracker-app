import "reflect-metadata";

import { CoinGeckoProvider } from "./coingecko.provider";
import { describe, expect, test } from "bun:test";

class TestableCoinGecko extends CoinGeckoProvider {
  public fakeResponse: unknown = null;
  public urlsCalled: string[] = [];
  public nextStatus = 200;

  protected async doFetch(url: string): Promise<Response> {
    this.urlsCalled.push(url);
    return new Response(JSON.stringify(this.fakeResponse), {
      status: this.nextStatus,
      headers: { "content-type": "application/json" },
    });
  }
}

describe("CoinGeckoProvider", () => {
  test("returns prices keyed by chainId:address.lower()", async () => {
    const p = new TestableCoinGecko();
    p.fakeResponse = { "0xaaa": { usd: 7.5 } };
    const result = await p.execute([{ chainId: 1, address: "0xAAA" }]);
    expect(result.get("1:0xaaa")?.priceUSD).toBe(7.5);
  });

  test("throws when API responds non-ok", async () => {
    const p = new TestableCoinGecko();
    p.nextStatus = 503;
    p.fakeResponse = {};
    await expect(p.execute([{ chainId: 1, address: "0xAAA" }])).rejects.toThrow(/503/);
  });

  test("groups queries by chain and makes one call per chain", async () => {
    const p = new TestableCoinGecko();
    p.fakeResponse = {};
    await p.execute([
      { chainId: 1, address: "0xAAA" },
      { chainId: 42161, address: "0xBBB" },
      { chainId: 1, address: "0xCCC" },
    ]);
    expect(p.urlsCalled).toHaveLength(2);
    expect(p.urlsCalled.some((u) => u.includes("/ethereum?"))).toBe(true);
    expect(p.urlsCalled.some((u) => u.includes("/arbitrum-one?"))).toBe(true);
  });

  test("filters out prices that are zero or missing usd", async () => {
    const p = new TestableCoinGecko();
    p.fakeResponse = {
      "0xaaa": { usd: 7.5 },
      "0xbbb": { usd: 0 },
      "0xccc": {},
    };
    const result = await p.execute([
      { chainId: 1, address: "0xAAA" },
      { chainId: 1, address: "0xBBB" },
      { chainId: 1, address: "0xCCC" },
    ]);
    expect(result.size).toBe(1);
    expect(result.get("1:0xaaa")?.priceUSD).toBe(7.5);
  });
});
