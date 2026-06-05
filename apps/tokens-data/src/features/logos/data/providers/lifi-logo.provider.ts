import { singleton } from "tsyringe";

import type { AsyncLogoProvider } from "../../domain/async-logo-provider";

const TIMEOUT = 3000;

type LiFiTokenResponse = {
  logoURI?: string;
};

@singleton()
export class LiFiLogo implements AsyncLogoProvider {
  readonly name = "lifi";

  async resolve(chainId: number, address: string): Promise<string | null> {
    const url = `https://li.quest/v1/token?chain=${chainId}&token=${address.toLowerCase()}`;
    const res = await this.fetchToken(url);
    if (!res.ok) return null;
    const data = (await res.json()) as LiFiTokenResponse;
    return data.logoURI ?? null;
  }

  protected async fetchToken(url: string): Promise<Response> {
    return fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
  }
}
