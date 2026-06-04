import { BaseExternalProvider, type ExternalProviderConfig } from "shared/providers/base-external-provider";
import { singleton } from "tsyringe";

import type { TokenPrice, TokenPriceQuery } from "../../domain/types";
import { cacheKey } from "../../domain/types";

const CHUNK_SIZE = 30;

@singleton()
export class DefiLlamaProvider extends BaseExternalProvider<TokenPriceQuery[], Map<string, TokenPrice>> {
  readonly config: ExternalProviderConfig = {
    name: "defillama",
    timeout: 5000,
    rateLimiter: { points: 100, duration: 60, execEvenly: true, execEvenlyMinDelayMs: 600 },
    circuitBreaker: { timeout: 5000, errorThresholdPercentage: 50, resetTimeout: 10_000, volumeThreshold: 5 },
  };

  private readonly chainNames: Record<number, string> = { 1: "ethereum", 42161: "arbitrum", 8453: "base" };

  protected async fetch(queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>> {
    const results = new Map<string, TokenPrice>();
    const supported = queries.filter((q) => this.chainNames[q.chainId]);
    if (supported.length === 0) return results;

    for (let i = 0; i < supported.length; i += CHUNK_SIZE) {
      const chunk = supported.slice(i, i + CHUNK_SIZE);
      const coins = chunk.map((q) => `${this.chainNames[q.chainId]}:${q.address}`).join(",");
      const url = `https://coins.llama.fi/prices/current/${coins}`;

      const res = await this.doFetch(url);
      if (!res.ok) throw new Error(`DefiLlama API error: ${res.status}`);

      const data = (await res.json()) as { coins: Record<string, { price: number; confidence: number }> };
      for (const query of chunk) {
        const key = `${this.chainNames[query.chainId]}:${query.address}`;
        const coin = data.coins[key];
        if (coin && coin.price > 0) {
          results.set(cacheKey(query.chainId, query.address), {
            priceUSD: coin.price,
            confidence: coin.confidence ?? 0.99,
          });
        }
      }
    }

    return results;
  }

  protected async doFetch(url: string): Promise<Response> {
    return fetch(url, { signal: AbortSignal.timeout(this.config.timeout) });
  }
}
