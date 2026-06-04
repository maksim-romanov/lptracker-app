import type { LogoProvider } from "../../domain/logo-provider";

const TIMEOUT_MS = 3000;

type LiFiTokenResponse = {
  logoURI?: string;
};

export class LiFiLogo implements LogoProvider {
  constructor(
    private chainId: number,
    private address: string,
  ) {}

  async resolve(): Promise<string | null> {
    const url = `https://li.quest/v1/token?chain=${this.chainId}&token=${this.address.toLowerCase()}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) return null;
      const data = (await res.json()) as LiFiTokenResponse;
      return data.logoURI ?? null;
    } catch {
      return null;
    }
  }
}
