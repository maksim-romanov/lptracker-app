import { BaseCache } from "shared/cache/base-cache";
import { inject, singleton } from "tsyringe";

import type { TokenPriceService } from "../domain/token-price-service";
import type { TokenPrice, TokenPriceQuery } from "../domain/types";
import { cacheKey } from "../domain/types";
import { TokenPriceResolver } from "./token-price.resolver";

@singleton()
export class TokenPriceCache extends BaseCache<TokenPrice> implements TokenPriceService {
  protected readonly prefix = "price";
  protected readonly ttl = 300;
  protected readonly freshTtl = 30;
  protected readonly staleTtl = 300;

  constructor(@inject(TokenPriceResolver) private readonly resolver: TokenPriceResolver) {
    super();
  }

  async getPrices(queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>> {
    return this.getOrSWRMany(
      queries,
      (q) => cacheKey(q.chainId, q.address),
      (missed) => this.resolver.resolve(missed),
    );
  }
}
