import "reflect-metadata";

import { container } from "tsyringe";

import type { TokenPriceQuery } from "../../../features/token-prices/domain/types";
import { TokensDataClient } from "./client";
import { TokensDataPriceAdapter } from "./price-adapter";
import { beforeEach, describe, expect, test } from "bun:test";

class FakeClient {
  next = { prices: {} as Record<string, { priceUSD: number; confidence: number } | null> };
  callCount = 0;
  async batchPrices(_tokens: TokenPriceQuery[]) {
    this.callCount++;
    return this.next;
  }
}

let client: FakeClient;

beforeEach(() => {
  container.clearInstances();
  client = new FakeClient();
  container.register(TokensDataClient, { useValue: client as unknown as TokensDataClient });
});

describe("TokensDataPriceAdapter", () => {
  test("maps batchPrices response into Map<key, TokenPrice>", async () => {
    client.next = { prices: { "1:0xeee": { priceUSD: 100, confidence: 0.99 } } };
    const adapter = container.resolve(TokensDataPriceAdapter);
    const result = await adapter.getPrices([{ chainId: 1, address: "0xeee" }]);
    expect(result.get("1:0xeee")?.priceUSD).toBe(100);
    expect(result.size).toBe(1);
  });

  test("skips null entries in response", async () => {
    client.next = { prices: { "1:0xeee": null } };
    const adapter = container.resolve(TokensDataPriceAdapter);
    const result = await adapter.getPrices([{ chainId: 1, address: "0xeee" }]);
    expect(result.size).toBe(0);
  });
});
