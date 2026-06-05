import { BaseExternalProvider, type ExternalProviderConfig } from "shared/providers/base-external-provider";
import { singleton } from "tsyringe";

import type { TokenPrice, TokenPriceQuery } from "../../domain/types";
import { cacheKey } from "../../domain/types";

@singleton()
export class CoinGeckoProvider extends BaseExternalProvider<TokenPriceQuery[], Map<string, TokenPrice>> {
  readonly config: ExternalProviderConfig = {
    name: "coingecko",
    timeout: 8000,
    rateLimiter: { points: 10, duration: 60, execEvenly: true, execEvenlyMinDelayMs: 6000 },
    circuitBreaker: { timeout: 8000, errorThresholdPercentage: 50, resetTimeout: 20_000, volumeThreshold: 5 },
  };

  private readonly chainNames: Record<number, string> = { 1: "ethereum", 42161: "arbitrum-one", 8453: "base" };

  protected async fetch(queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>> {
    const results = new Map<string, TokenPrice>();

    const byChain = new Map<number, TokenPriceQuery[]>();
    for (const q of queries) {
      if (!this.chainNames[q.chainId]) continue;
      const group = byChain.get(q.chainId) ?? [];
      group.push(q);
      byChain.set(q.chainId, group);
    }

    for (const [chainId, group] of byChain) {
      const platform = this.chainNames[chainId];
      const addresses = group.map((q) => q.address.toLowerCase()).join(",");
      const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${addresses}&vs_currencies=usd`;

      const res = await this.doFetch(url);
      if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);

      const data = (await res.json()) as Record<string, { usd?: number }>;
      for (const query of group) {
        const entry = data[query.address.toLowerCase()];
        if (entry?.usd && entry.usd > 0) {
          results.set(cacheKey(query.chainId, query.address), { priceUSD: entry.usd, confidence: 0.99 });
        }
      }
    }

    return results;
  }

  protected async doFetch(url: string): Promise<Response> {
    return fetch(url, { signal: AbortSignal.timeout(this.config.timeout) });
  }
}
