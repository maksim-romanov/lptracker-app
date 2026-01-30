import pLimit from "p-limit";
import { inject, singleton } from "tsyringe";

import type { TokenLogo } from "../domain/token-logo";
import { TokenLogoResolver } from "./token-logo.resolver";

const TTL = 24 * 60 * 60 * 1000;
const CONCURRENCY = 5;

type CacheEntry = { url: string | null; expiresAt: number };

@singleton()
export class TokenLogoCache implements TokenLogo {
  private cache = new Map<string, CacheEntry>();
  private limit = pLimit(CONCURRENCY);

  constructor(@inject(TokenLogoResolver) private readonly inner: TokenLogoResolver) {}

  async resolve(chainId: number, address: string): Promise<string | null> {
    const key = cacheKey(chainId, address);
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.url;

    return this.limit(async () => {
      const rechecked = this.cache.get(key);
      if (rechecked && rechecked.expiresAt > Date.now()) return rechecked.url;

      const url = await this.inner.resolve(chainId, address);
      this.cache.set(key, { url, expiresAt: Date.now() + TTL });
      return url;
    });
  }

  async resolveMany(tokens: { chainId: number; address: string }[]): Promise<Map<string, string | null>> {
    const unique = new Map<string, { chainId: number; address: string }>();
    for (const t of tokens) unique.set(cacheKey(t.chainId, t.address), t);

    const results = new Map<string, string | null>();
    await Promise.all(
      Array.from(unique.entries()).map(async ([key, t]) => {
        results.set(key, await this.resolve(t.chainId, t.address));
      }),
    );
    return results;
  }
}

function cacheKey(chainId: number, address: string) {
  return `${chainId}-${address.toLowerCase()}`;
}
