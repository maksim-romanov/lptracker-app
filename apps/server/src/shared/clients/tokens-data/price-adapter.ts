import { inject, singleton } from "tsyringe";

import type { TokenPriceService } from "../../../features/token-prices/domain/token-price-service";
import type { TokenPrice, TokenPriceQuery } from "../../../features/token-prices/domain/types";
import { TokensDataClient } from "./client";

@singleton()
export class TokensDataPriceAdapter implements TokenPriceService {
  constructor(@inject(TokensDataClient) private readonly client: TokensDataClient) {}

  async getPrices(queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>> {
    const response = await this.client.batchPrices(queries);
    const map = new Map<string, TokenPrice>();
    for (const [key, value] of Object.entries(response.prices)) {
      if (value == null) continue;
      map.set(key, { priceUSD: value.priceUSD, confidence: value.confidence });
    }
    return map;
  }
}
