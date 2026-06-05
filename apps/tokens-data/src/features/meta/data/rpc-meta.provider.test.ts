import "reflect-metadata";

import { describe, expect, test } from "bun:test";

import { RpcMetaProvider } from "./rpc-meta.provider";

class TestableRpcProvider extends RpcMetaProvider {
  public multicallCalls: Array<{ chainId: number; addresses: string[] }> = [];
  public mockResponses = new Map<string, { name: string; symbol: string; decimals: number }>();

  protected async multicall(chainId: number, addresses: string[]) {
    this.multicallCalls.push({ chainId, addresses });
    return addresses.map((address) => {
      const key = `${chainId}:${address.toLowerCase()}`;
      const entry = this.mockResponses.get(key);
      if (!entry) return null;
      return entry;
    });
  }
}

describe("RpcMetaProvider", () => {
  test("returns meta map keyed by chainId:address.lower()", async () => {
    const p = new TestableRpcProvider();
    p.mockResponses.set("1:0xaaa", { name: "Token A", symbol: "TKA", decimals: 18 });
    const result = await p.execute([{ chainId: 1, address: "0xAAA" }]);
    expect(result.get("1:0xaaa")?.name).toBe("Token A");
    expect(result.get("1:0xaaa")?.symbol).toBe("TKA");
    expect(result.get("1:0xaaa")?.decimals).toBe(18);
  });

  test("groups by chainId and makes one multicall per chain", async () => {
    const p = new TestableRpcProvider();
    p.mockResponses.set("1:0xaaa", { name: "A", symbol: "A", decimals: 18 });
    p.mockResponses.set("42161:0xbbb", { name: "B", symbol: "B", decimals: 6 });
    await p.execute([
      { chainId: 1, address: "0xAAA" },
      { chainId: 42161, address: "0xBBB" },
      { chainId: 1, address: "0xCCC" },
    ]);
    expect(p.multicallCalls).toHaveLength(2);
    const chainsCalled = p.multicallCalls.map((c) => c.chainId).sort();
    expect(chainsCalled).toEqual([1, 42161]);
  });

  test("omits tokens whose multicall slot returned null (non-compliant)", async () => {
    const p = new TestableRpcProvider();
    p.mockResponses.set("1:0xaaa", { name: "A", symbol: "A", decimals: 18 });
    const result = await p.execute([
      { chainId: 1, address: "0xAAA" },
      { chainId: 1, address: "0xBBB" }, // not in mockResponses → null
    ]);
    expect(result.size).toBe(1);
    expect(result.get("1:0xaaa")).toBeDefined();
    expect(result.get("1:0xbbb")).toBeUndefined();
  });
});
