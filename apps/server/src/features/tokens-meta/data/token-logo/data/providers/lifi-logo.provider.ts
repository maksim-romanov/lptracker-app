import type { ILogoProvider, TLogoResult } from "../../domain/logo-provider";

const TIMEOUT_MS = 3000;

type TLiFiTokenResponse = {
  logoURI?: string;
};

export class LiFiLogo implements ILogoProvider {
  constructor(
    private chainId: number,
    private address: string,
  ) {}

  async resolve(): Promise<TLogoResult | null> {
    const url = `https://li.quest/v1/token?chain=${this.chainId}&token=${this.address.toLowerCase()}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) return null;
      const data = (await res.json()) as TLiFiTokenResponse;
      return data.logoURI ? { url: data.logoURI, verified: true } : null;
    } catch {
      return null;
    }
  }
}
