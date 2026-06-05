import { container } from "tsyringe";

import { TokensDataPriceAdapter } from "../data/tokens-data-price-adapter";
import { TOKEN_PRICE_SERVICE } from "./tokens";

export function register() {
  container.register(TOKEN_PRICE_SERVICE, { useToken: TokensDataPriceAdapter });
}
