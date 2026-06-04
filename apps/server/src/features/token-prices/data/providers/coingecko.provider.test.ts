import "reflect-metadata";

import { CoinGeckoProvider } from "./coingecko.provider";
import { describe, expect, test } from "bun:test";

class TestableCoinGecko extends CoinGeckoProvider {
  public fakeResponse: unknown = null;
  protected async doFetch(_url: string): Promise<Response> {
    return new Response(JSON.stringify(this.fakeResponse), {
      status: 200,
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
});
