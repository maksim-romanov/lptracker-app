import "reflect-metadata";

import { DefiLlamaStablesProvider } from "./defillama-stables.provider";
import { describe, expect, test } from "bun:test";

class Testable extends DefiLlamaStablesProvider {
  public summary: Array<{ id: string; symbol?: string }> = [];
  public details = new Map<string, { symbol?: string; address?: string | null } | null>();
  public failSummary = false;

  protected async fetchSummary() {
    if (this.failSummary) throw new Error("summary boom");
    return this.summary;
  }

  protected async fetchDetailSafe(id: string) {
    return this.details.get(id) ?? null;
  }
}

describe("DefiLlamaStablesProvider", () => {
  test("maps each summary entry to its detail address on chain 1", async () => {
    const p = new Testable();
    p.summary = [
      { id: "1", symbol: "USDT" },
      { id: "2", symbol: "USDC" },
    ];
    p.details.set("1", { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" });
    p.details.set("2", { symbol: "USDC", address: "0xA0b86991c6218b36c1D19D4a2e9EB0cE3606eB48" });

    const result = await p.resolve();

    expect(result).toEqual([
      { chainId: 1, address: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbol: "USDT" },
      { chainId: 1, address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC" },
    ]);
  });

  test("skips assets without a canonical address", async () => {
    const p = new Testable();
    p.summary = [{ id: "1", symbol: "USTC" }];
    p.details.set("1", { symbol: "USTC", address: null });
    expect(await p.resolve()).toEqual([]);
  });

  test("uses summary symbol when detail symbol missing", async () => {
    const p = new Testable();
    p.summary = [{ id: "1", symbol: "USDT" }];
    p.details.set("1", { address: "0xdac17f958d2ee523a2206206994597c13d831ec7" });
    const result = await p.resolve();
    expect(result[0]?.symbol).toBe("USDT");
  });

  test("propagates summary failures", async () => {
    const p = new Testable();
    p.failSummary = true;
    await expect(p.resolve()).rejects.toThrow();
  });
});
