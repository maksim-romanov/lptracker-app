import "reflect-metadata";

import { DefiLlamaProvider } from "./defillama.provider";
import { describe, expect, test } from "bun:test";

class TestableDefiLlama extends DefiLlamaProvider {
  public fakeResponse: unknown = null;
  public lastUrl: string | null = null;
  public urlsCalled: string[] = [];
  public nextStatus = 200;

  protected async doFetch(url: string): Promise<Response> {
    this.lastUrl = url;
    this.urlsCalled.push(url);
    return new Response(JSON.stringify(this.fakeResponse), {
      status: this.nextStatus,
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

  test("throws when API responds non-ok", async () => {
    const p = new TestableDefiLlama();
    p.nextStatus = 500;
    p.fakeResponse = {};
    await expect(p.execute([{ chainId: 1, address: "0xAAA" }])).rejects.toThrow(/500/);
  });

  test("chunks queries above CHUNK_SIZE=30 into multiple doFetch calls", async () => {
    const p = new TestableDefiLlama();
    p.fakeResponse = { coins: {} };
    const queries = Array.from({ length: 50 }, (_, i) => ({
      chainId: 1,
      address: `0x${i.toString(16).padStart(40, "0")}`,
    }));
    await p.execute(queries);
    expect(p.urlsCalled).toHaveLength(2);
    const firstCoins = p.urlsCalled[0]!.split("/current/")[1]!;
    expect(firstCoins.split(",")).toHaveLength(30);
    const secondCoins = p.urlsCalled[1]!.split("/current/")[1]!;
    expect(secondCoins.split(",")).toHaveLength(20);
  });
});
