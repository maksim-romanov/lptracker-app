import { BaseCache } from "shared/cache/base-cache";
import { inject, singleton } from "tsyringe";

import type { TokenMetaService } from "../domain/token-meta-service";
import type { TokenMeta, TokenMetaQuery } from "../domain/types";
import { metaCacheKey } from "../domain/types";
import { RpcMetaProvider } from "./rpc-meta.provider";

const THIRTY_DAYS = 30 * 24 * 60 * 60;

@singleton()
export class TokenMetaCache extends BaseCache<TokenMeta> implements TokenMetaService {
  protected readonly prefix = "meta";
  protected readonly ttl = THIRTY_DAYS;

  constructor(@inject(RpcMetaProvider) private readonly provider: RpcMetaProvider) {
    super();
  }

  async getMeta(queries: TokenMetaQuery[]): Promise<Map<string, TokenMeta>> {
    return this.getOrFetchMany(
      queries,
      (q) => metaCacheKey(q.chainId, q.address),
      (missed) => this.coalesceMany(this.batchKey(missed), () => this.provider.execute(missed)),
    );
  }

  private batchKey(queries: TokenMetaQuery[]): string {
    return queries
      .map((q) => metaCacheKey(q.chainId, q.address))
      .sort()
      .join("|");
  }
}
