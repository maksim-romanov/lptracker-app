import type { TokenPrice, TokenPriceQuery } from "./types";

export interface TokenPriceService {
  getPrices(queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>>;
}
