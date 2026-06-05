import type { TokenMeta, TokenMetaQuery } from "./types";

export interface TokenMetaService {
  getMeta(queries: TokenMetaQuery[]): Promise<Map<string, TokenMeta>>;
}
