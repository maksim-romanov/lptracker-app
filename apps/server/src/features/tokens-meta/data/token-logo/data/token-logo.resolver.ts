import { inject, singleton } from "tsyringe";

import type { AsyncLogoProvider } from "../domain/async-logo-provider";
import type { TokenLogo } from "../domain/token-logo";
import { OneInchLogo } from "./providers/oneinch-logo.provider";
import { TrustWalletLogo } from "./providers/trustwallet-logo.provider";

@singleton()
export class TokenLogoResolver implements TokenLogo {
  private readonly providers: AsyncLogoProvider[];

  constructor(@inject(TrustWalletLogo) trustwallet: TrustWalletLogo, @inject(OneInchLogo) oneinch: OneInchLogo) {
    this.providers = [trustwallet, oneinch];
  }

  async resolve(chainId: number, address: string): Promise<string | null> {
    for (const provider of this.providers) {
      try {
        const url = await provider.resolve(chainId, address);
        if (url) return url;
      } catch {}
    }
    return null;
  }

  async resolveMany(tokens: { chainId: number; address: string }[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();
    for (const t of tokens) {
      results.set(`${t.chainId}:${t.address.toLowerCase()}`, await this.resolve(t.chainId, t.address));
    }
    return results;
  }
}
