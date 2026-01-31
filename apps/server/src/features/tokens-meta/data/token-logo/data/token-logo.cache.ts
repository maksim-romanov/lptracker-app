import pLimit from "p-limit";
import { BaseCache } from "shared/cache/base-cache";
import { inject, singleton } from "tsyringe";

import type { TokenLogo } from "../domain/token-logo";
import { TokenLogoResolver } from "./token-logo.resolver";

@singleton()
export class TokenLogoCache extends BaseCache<string | null> implements TokenLogo {
  protected readonly prefix = "logo";
  protected readonly ttl = 86400;

  private readonly limit = pLimit(5);

  constructor(@inject(TokenLogoResolver) private readonly inner: TokenLogoResolver) {
    super();
  }

  async resolve(chainId: number, address: string): Promise<string | null> {
    return this.getOrFetch(logoCacheKey(chainId, address), () =>
      this.limit(() => this.inner.resolve(chainId, address)),
    );
  }

  async resolveMany(tokens: { chainId: number; address: string }[]): Promise<Map<string, string | null>> {
    const unique = new Map<string, { chainId: number; address: string }>();
    for (const t of tokens) unique.set(logoCacheKey(t.chainId, t.address), t);

    const results = new Map<string, string | null>();
    await Promise.all(
      Array.from(unique.entries()).map(async ([key, t]) => {
        results.set(key, await this.resolve(t.chainId, t.address));
      }),
    );
    return results;
  }
}

function logoCacheKey(chainId: number, address: string) {
  return `${chainId}:${address.toLowerCase()}`;
}
