import { singleton } from "tsyringe";

import type { ILogoProvider } from "../domain/logo-provider";
import type { TokenLogo } from "../domain/token-logo";
import { LiFiLogo } from "./providers/lifi-logo.provider";
import { OneInchLogo } from "./providers/oneinch-logo.provider";
import { TrustWalletLogo } from "./providers/trustwallet-logo.provider";

type TLogoProviderConstructor = new (chainId: number, address: string) => ILogoProvider;

const PROVIDERS: TLogoProviderConstructor[] = [TrustWalletLogo, OneInchLogo, LiFiLogo];
const HEAD_TIMEOUT_MS = 3000;

@singleton()
export class TokenLogoResolver implements TokenLogo {
  async resolve(chainId: number, address: string): Promise<string | null> {
    for (const Provider of PROVIDERS) {
      const result = await new Provider(chainId, address).resolve();
      if (!result) continue;
      if (result.verified) return result.url;
      try {
        const res = await fetch(result.url, { method: "HEAD", signal: AbortSignal.timeout(HEAD_TIMEOUT_MS) });
        if (res.ok) return result.url;
      } catch {}
    }
    return null;
  }

  async resolveMany(tokens: { chainId: number; address: string }[]): Promise<Map<string, string | null>> {
    const entries = await Promise.all(
      tokens.map(async (t) => [cacheKey(t.chainId, t.address), await this.resolve(t.chainId, t.address)] as const),
    );
    return new Map(entries);
  }
}

function cacheKey(chainId: number, address: string) {
  return `${chainId}-${address.toLowerCase()}`;
}
