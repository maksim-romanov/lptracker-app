import { container } from "tsyringe";

import { TokenMetaCache } from "../data/token-meta.cache";
import { TOKEN_META_SERVICE } from "./tokens";

export function register(): void {
  container.register(TOKEN_META_SERVICE, { useToken: TokenMetaCache });
}
