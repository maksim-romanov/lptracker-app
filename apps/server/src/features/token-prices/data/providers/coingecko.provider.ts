import CircuitBreaker from "opossum";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { singleton } from "tsyringe";

import type { PriceProvider, PriceProviderConfig } from "../../domain/price-provider";
import type { TokenPrice, TokenPriceQuery } from "../../domain/types";
import { cacheKey } from "../../domain/types";

@singleton()
export class CoinGeckoProvider implements PriceProvider {
  readonly name = "coingecko";

  readonly config: PriceProviderConfig = {
    timeout: 8000,
    rateLimiter: { points: 10, duration: 60, execEvenly: true, execEvenlyMinDelayMs: 6000 },
    circuitBreaker: { timeout: 8000, errorThresholdPercentage: 50, resetTimeout: 20_000, volumeThreshold: 5 },
    chainNames: { 1: "ethereum", 42161: "arbitrum-one", 8453: "base" },
  };

  private readonly rateLimiter = new RateLimiterMemory({
    points: this.config.rateLimiter.points,
    duration: this.config.rateLimiter.duration,
    execEvenly: this.config.rateLimiter.execEvenly,
    execEvenlyMinDelayMs: this.config.rateLimiter.execEvenlyMinDelayMs,
  });

  private readonly circuitBreaker = new CircuitBreaker(this.fetchPrices.bind(this), {
    timeout: this.config.circuitBreaker.timeout,
    errorThresholdPercentage: this.config.circuitBreaker.errorThresholdPercentage,
    resetTimeout: this.config.circuitBreaker.resetTimeout,
    volumeThreshold: this.config.circuitBreaker.volumeThreshold,
  });

  async getPrices(queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>> {
    return this.circuitBreaker.fire(queries);
  }

  private async fetchPrices(queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>> {
    await this.rateLimiter.consume(this.name);

    const results = new Map<string, TokenPrice>();

    const byChain = new Map<number, TokenPriceQuery[]>();
    for (const q of queries) {
      if (!this.config.chainNames[q.chainId]) continue;
      const group = byChain.get(q.chainId) ?? [];
      group.push(q);
      byChain.set(q.chainId, group);
    }

    for (const [chainId, group] of byChain) {
      const platform = this.config.chainNames[chainId];
      const addresses = group.map((q) => q.address.toLowerCase()).join(",");

      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${addresses}&vs_currencies=usd`,
        { signal: AbortSignal.timeout(this.config.timeout) },
      );

      if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);

      const data = (await res.json()) as Record<string, { usd?: number }>;

      for (const query of group) {
        const entry = data[query.address.toLowerCase()];
        if (entry?.usd && entry.usd > 0) {
          results.set(cacheKey(query.chainId, query.address), {
            priceUSD: entry.usd,
            confidence: 0.99,
          });
        }
      }
    }

    return results;
  }
}
