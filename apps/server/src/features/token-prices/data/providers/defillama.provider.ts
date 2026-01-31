import CircuitBreaker from "opossum";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { singleton } from "tsyringe";

import type { PriceProvider, PriceProviderConfig } from "../../domain/price-provider";
import type { TokenPrice, TokenPriceQuery } from "../../domain/types";
import { cacheKey } from "../../domain/types";

const CHUNK_SIZE = 30;

@singleton()
export class DefiLlamaProvider implements PriceProvider {
  readonly name = "defillama";

  readonly config: PriceProviderConfig = {
    timeout: 5000,
    rateLimiter: { points: 100, duration: 60, execEvenly: true, execEvenlyMinDelayMs: 600 },
    circuitBreaker: { timeout: 5000, errorThresholdPercentage: 50, resetTimeout: 10_000, volumeThreshold: 5 },
    chainNames: { 1: "ethereum", 42161: "arbitrum", 8453: "base" },
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

    const supported = queries.filter((q) => this.config.chainNames[q.chainId]);
    if (supported.length === 0) return results;

    const chunks: TokenPriceQuery[][] = [];
    for (let i = 0; i < supported.length; i += CHUNK_SIZE) {
      chunks.push(supported.slice(i, i + CHUNK_SIZE));
    }

    for (const chunk of chunks) {
      const coins = chunk.map((q) => `${this.config.chainNames[q.chainId]}:${q.address}`).join(",");

      const res = await fetch(`https://coins.llama.fi/prices/current/${coins}`, {
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!res.ok) throw new Error(`DefiLlama API error: ${res.status}`);

      const data = (await res.json()) as {
        coins: Record<string, { price: number; confidence: number }>;
      };

      for (const query of chunk) {
        const key = `${this.config.chainNames[query.chainId]}:${query.address}`;
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
}
