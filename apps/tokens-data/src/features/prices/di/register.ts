import { container } from "tsyringe";

import { TokenPriceCache } from "../data/token-price.cache";
import { TOKEN_PRICE_SERVICE } from "./tokens";

export function register() {
  container.register(TOKEN_PRICE_SERVICE, { useToken: TokenPriceCache });
}
