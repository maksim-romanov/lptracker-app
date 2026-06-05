import { BaseCache } from "shared/cache/base-cache";
import { inject, singleton } from "tsyringe";

import type { TokenLogo } from "../domain/token-logo";
import { TokenLogoResolver } from "./token-logo.resolver";

@singleton()
export class TokenLogoCache extends BaseCache<string | null> implements TokenLogo {
  protected readonly prefix = "logo";
  protected readonly ttl = 86400;

  constructor(@inject(TokenLogoResolver) private readonly inner: TokenLogoResolver) {
    super();
  }

  async resolve(chainId: number, address: string): Promise<string | null> {
    const id = `${chainId}:${address.toLowerCase()}`;
    return this.getOrFetch(id, () => this.coalesce(`logo:${id}`, () => this.inner.resolve(chainId, address)));
  }

  async resolveMany(tokens: { chainId: number; address: string }[]): Promise<Map<string, string | null>> {
    const unique = new Map<string, { chainId: number; address: string }>();
    for (const t of tokens) unique.set(`${t.chainId}:${t.address.toLowerCase()}`, t);

    const results = new Map<string, string | null>();
    await Promise.all(
      Array.from(unique.entries()).map(async ([key, t]) => {
        results.set(key, await this.resolve(t.chainId, t.address));
      }),
    );
    return results;
  }
}
