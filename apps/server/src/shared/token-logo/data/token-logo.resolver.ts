import { singleton } from "tsyringe";

import type { LogoProvider } from "../domain/logo-provider";
import type { TokenLogo } from "../domain/token-logo";
import { OneInchLogo } from "./providers/oneinch-logo.provider";
import { TrustWalletLogo } from "./providers/trustwallet-logo.provider";

type LogoProviderConstructor = new (chainId: number, address: string) => LogoProvider;

const PROVIDERS: LogoProviderConstructor[] = [TrustWalletLogo, OneInchLogo];
const TIMEOUT = 3000;

@singleton()
export class TokenLogoResolver implements TokenLogo {
  async resolve(chainId: number, address: string): Promise<string | null> {
    for (const Provider of PROVIDERS) {
      const { url } = new Provider(chainId, address);
      if (!url) continue;
      try {
        const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(TIMEOUT) });
        if (res.ok) return url;
      } catch {}
    }
    return null;
  }

  async resolveMany(tokens: { chainId: number; address: string }[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();
    for (const t of tokens) {
      results.set(cacheKey(t.chainId, t.address), await this.resolve(t.chainId, t.address));
    }
    return results;
  }
}

function cacheKey(chainId: number, address: string) {
  return `${chainId}-${address.toLowerCase()}`;
}
