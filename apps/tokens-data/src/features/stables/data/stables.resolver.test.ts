import "reflect-metadata";

import { container } from "tsyringe";

import { CoinGeckoStablesProvider } from "./providers/coingecko-stables.provider";
import { DefiLlamaStablesProvider } from "./providers/defillama-stables.provider";
import { StablesResolver } from "./stables.resolver";
import { beforeEach, describe, expect, test } from "bun:test";

class CGStub extends CoinGeckoStablesProvider {
  public next: { chainId: number; address: string; symbol: string }[] = [];
  public throws = false;
  async resolve() {
    if (this.throws) throw new Error("cg boom");
    return this.next;
  }
}

class DLStub extends DefiLlamaStablesProvider {
  public next: { chainId: number; address: string; symbol: string }[] = [];
  public throws = false;
  async resolve() {
    if (this.throws) throw new Error("dl boom");
    return this.next;
  }
}

let cg: CGStub;
let dl: DLStub;

beforeEach(() => {
  container.clearInstances();
  cg = new CGStub();
  dl = new DLStub();
  container.register(CoinGeckoStablesProvider, { useValue: cg as unknown as CoinGeckoStablesProvider });
  container.register(DefiLlamaStablesProvider, { useValue: dl as unknown as DefiLlamaStablesProvider });
});

describe("StablesResolver", () => {
  test("merges and dedupes entries from both providers", async () => {
    cg.next = [
      { chainId: 1, address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC" },
      { chainId: 8453, address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", symbol: "USDC" },
    ];
    dl.next = [
      { chainId: 1, address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC" },
      { chainId: 1, address: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbol: "USDT" },
    ];

    const r = container.resolve(StablesResolver);
    const result = await r.resolve();
    expect(result.length).toBe(3);
  });

  test("returns sorted by chainId then address", async () => {
    cg.next = [
      { chainId: 8453, address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", symbol: "USDC" },
      { chainId: 1, address: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbol: "USDT" },
      { chainId: 1, address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC" },
    ];
    const r = container.resolve(StablesResolver);
    const result = await r.resolve();
    expect(result.map((e) => `${e.chainId}:${e.address}`)).toEqual([
      "1:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "1:0xdac17f958d2ee523a2206206994597c13d831ec7",
      "8453:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    ]);
  });

  test("succeeds when one provider fails and the other succeeds", async () => {
    cg.throws = true;
    dl.next = [{ chainId: 1, address: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbol: "USDT" }];
    const r = container.resolve(StablesResolver);
    const result = await r.resolve();
    expect(result.length).toBe(1);
  });

  test("throws when both providers fail", async () => {
    cg.throws = true;
    dl.throws = true;
    const r = container.resolve(StablesResolver);
    await expect(r.resolve()).rejects.toThrow();
  });
});
