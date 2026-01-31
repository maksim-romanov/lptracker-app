import { inject, singleton } from "tsyringe";

import type { PriceProvider } from "../domain/price-provider";
import type { TokenPrice, TokenPriceQuery } from "../domain/types";
import { CoinGeckoProvider } from "./providers/coingecko.provider";
import { DefiLlamaProvider } from "./providers/defillama.provider";

@singleton()
export class TokenPriceResolver {
  private readonly providers: PriceProvider[];

  constructor(
    @inject(DefiLlamaProvider) defillama: DefiLlamaProvider,
    @inject(CoinGeckoProvider) coingecko: CoinGeckoProvider,
  ) {
    this.providers = [defillama, coingecko];
  }

  async resolve(queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>> {
    if (queries.length === 0) return new Map();

    for (const provider of this.providers) {
      try {
        return await provider.getPrices(queries);
      } catch {
        // Provider failed (circuit open or fetch error), try next
      }
    }

    return new Map();
  }
}
