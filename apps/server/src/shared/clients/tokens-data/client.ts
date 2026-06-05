import { singleton } from "tsyringe";

type BatchPricesResponse = {
  prices: Record<string, { priceUSD: number; confidence: number } | null>;
};

@singleton()
export class TokensDataClient {
  private readonly baseUrl = process.env.TOKENS_DATA_URL ?? "http://localhost:3100";
  private readonly timeout = 5000;

  async batchPrices(tokens: Array<{ chainId: number; address: string }>): Promise<BatchPricesResponse> {
    const res = await this.doFetch(`${this.baseUrl}/v1/batch/prices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokens }),
      signal: AbortSignal.timeout(this.timeout),
    });
    if (!res.ok) throw new TokensDataError(res.status, await res.text());
    return (await res.json()) as BatchPricesResponse;
  }

  async getLogoUrl(chainId: number, address: string): Promise<string | null> {
    const res = await this.doFetch(
      `${this.baseUrl}/v1/chains/${chainId}/tokens/${address}/logo.png`,
      { method: "GET", redirect: "manual", signal: AbortSignal.timeout(this.timeout) },
    );
    if (res.status === 302) return res.headers.get("location");
    if (res.status === 404) return null;
    throw new TokensDataError(res.status, await res.text());
  }

  protected async doFetch(url: string, init?: RequestInit): Promise<Response> {
    return fetch(url, init);
  }
}

export class TokensDataError extends Error {
  constructor(
    readonly status: number,
    body: string,
  ) {
    super(`tokens-data ${status}: ${body}`);
  }
}
