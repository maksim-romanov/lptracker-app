import { BaseCache } from "shared/cache/base-cache";
import { inject, singleton } from "tsyringe";

import type { TokenPriceService } from "../domain/token-price-service";
import type { TokenPrice, TokenPriceQuery } from "../domain/types";
import { cacheKey } from "../domain/types";
import { TokenPriceResolver } from "./token-price.resolver";

@singleton()
export class TokenPriceCache extends BaseCache<TokenPrice> implements TokenPriceService {
  protected readonly prefix = "price";
  protected readonly ttl = 60;

  private inflight = new Map<string, Promise<Map<string, TokenPrice>>>();

  constructor(@inject(TokenPriceResolver) private readonly resolver: TokenPriceResolver) {
    super();
  }

  async getPrices(queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>> {
    return this.getOrFetchMany(
      queries,
      (q) => cacheKey(q.chainId, q.address),
      (missed) => this.dedup(missed),
    );
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
