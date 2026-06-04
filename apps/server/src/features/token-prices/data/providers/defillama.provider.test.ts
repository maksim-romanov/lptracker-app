import "reflect-metadata";

import { DefiLlamaProvider } from "./defillama.provider";
import { describe, expect, test } from "bun:test";

class TestableDefiLlama extends DefiLlamaProvider {
  public fakeResponse: unknown = null;
  public lastUrl: string | null = null;

  protected async doFetch(url: string): Promise<Response> {
    this.lastUrl = url;
    return new Response(JSON.stringify(this.fakeResponse), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
}

describe("DefiLlamaProvider", () => {
  test("returns prices keyed by chainId:address.lower()", async () => {
    const p = new TestableDefiLlama();
    p.fakeResponse = { coins: { "ethereum:0xAAA": { price: 12.5, confidence: 0.95 } } };
    const result = await p.execute([{ chainId: 1, address: "0xAAA" }]);
    expect(result.get("1:0xaaa")?.priceUSD).toBe(12.5);
    expect(result.get("1:0xaaa")?.confidence).toBe(0.95);
  });

  test("skips unsupported chains", async () => {
    const p = new TestableDefiLlama();
    p.fakeResponse = { coins: {} };
    const result = await p.execute([{ chainId: 9999, address: "0xAAA" }]);
    expect(result.size).toBe(0);
  });
});
