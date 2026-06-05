import "reflect-metadata";

import { TokensDataClient, TokensDataError } from "./tokens-data-client";
import { describe, expect, test } from "bun:test";

class TestableClient extends TokensDataClient {
  public nextResponse: { status: number; body: unknown; headers?: Record<string, string> } = {
    status: 200,
    body: { prices: {} },
  };
  public lastRequest: { method: string; url: string; body?: string } | null = null;

  protected async doFetch(url: string, init?: RequestInit): Promise<Response> {
    this.lastRequest = { method: init?.method ?? "GET", url, body: init?.body as string | undefined };
    return new Response(this.nextResponse.body == null ? null : JSON.stringify(this.nextResponse.body), {
      status: this.nextResponse.status,
      headers: this.nextResponse.headers ?? { "content-type": "application/json" },
    });
  }
}

describe("TokensDataClient", () => {
  test("batchPrices posts JSON to /v1/batch/prices and returns body", async () => {
    const c = new TestableClient();
    c.nextResponse = { status: 200, body: { prices: { "1:0xeee": { priceUSD: 100, confidence: 0.99 } } } };
    const result = await c.batchPrices([{ chainId: 1, address: "0xeee" }]);
    expect(c.lastRequest?.method).toBe("POST");
    expect(c.lastRequest?.url).toContain("/v1/batch/prices");
    expect(result.prices["1:0xeee"]?.priceUSD).toBe(100);
  });

  test("batchPrices throws TokensDataError on non-2xx", async () => {
    const c = new TestableClient();
    c.nextResponse = { status: 503, body: "upstream down" };
    await expect(c.batchPrices([{ chainId: 1, address: "0xeee" }])).rejects.toThrow(TokensDataError);
  });

  test("getLogoUrl reads Location header from 302", async () => {
    const c = new TestableClient();
    c.nextResponse = {
      status: 302,
      body: null,
      headers: { location: "https://cdn.example/x.png" },
    };
    const url = await c.getLogoUrl(1, "0xabc");
    expect(url).toBe("https://cdn.example/x.png");
  });

  test("getLogoUrl returns null on 404", async () => {
    const c = new TestableClient();
    c.nextResponse = { status: 404, body: { error: "not found" } };
    const url = await c.getLogoUrl(1, "0xabc");
    expect(url).toBeNull();
  });
});
