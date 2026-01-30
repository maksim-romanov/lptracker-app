import { container } from "tsyringe";

import { TokenLogoCache } from "../token-logo/data/token-logo.cache";
import { TOKEN_LOGO_SERVICE } from "./tokens";

export function register() {
  container.register(TOKEN_LOGO_SERVICE, { useToken: TokenLogoCache });
}
