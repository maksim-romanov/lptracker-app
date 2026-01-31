import { inject, singleton } from "tsyringe";

import type { TokenPriceService } from "../domain/token-price-service";
import type { TokenPrice, TokenPriceQuery } from "../domain/types";
import { cacheKey } from "../domain/types";
import { TokenPriceResolver } from "./token-price.resolver";

const TTL = 60_000;

type CacheEntry = { value: TokenPrice; expiresAt: number };

@singleton()
export class TokenPriceCache implements TokenPriceService {
  private cache = new Map<string, CacheEntry>();
  private inflight = new Map<string, Promise<Map<string, TokenPrice>>>();

  constructor(@inject(TokenPriceResolver) private readonly resolver: TokenPriceResolver) {}

  async getPrices(queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>> {
    const now = Date.now();
    const results = new Map<string, TokenPrice>();
    const missing: TokenPriceQuery[] = [];

    for (const query of queries) {
      const key = cacheKey(query.chainId, query.address);
      const cached = this.cache.get(key);
      if (cached && cached.expiresAt > now) {
        results.set(key, cached.value);
      } else {
        missing.push(query);
      }
    }

    if (missing.length === 0) return results;

    const fetched = await this.dedup(missing);

    for (const query of missing) {
      const key = cacheKey(query.chainId, query.address);
      const price = fetched.get(key);
      if (price) {
        this.cache.set(key, { value: price, expiresAt: Date.now() + TTL });
        results.set(key, price);
      }
    }

    return results;
  }

  private async dedup(queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>> {
    const batchKey = queries
      .map((q) => cacheKey(q.chainId, q.address))
      .sort()
      .join("|");

    const existing = this.inflight.get(batchKey);
    if (existing) return existing;

    const promise = this.resolver.resolve(queries).finally(() => {
      this.inflight.delete(batchKey);
    });

    this.inflight.set(batchKey, promise);
    return promise;
  }
}
