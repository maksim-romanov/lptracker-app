import type { TokenPrice, TokenPriceQuery } from "./types";

export interface PriceProvider {
  readonly config: { readonly name: string };
  execute(queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>>;
}
