import { singleton } from "tsyringe";
import { getAddress } from "viem";

import type { AsyncLogoProvider } from "../../domain/async-logo-provider";

const CHAIN_NAMES: Record<number, string> = { 1: "ethereum", 42161: "arbitrum", 8453: "base" };
const TIMEOUT = 3000;

@singleton()
export class TrustWalletLogo implements AsyncLogoProvider {
  readonly name = "trustwallet";

  async resolve(chainId: number, address: string): Promise<string | null> {
    const chain = CHAIN_NAMES[chainId];
    if (!chain) return null;
    const url = `https://assets-cdn.trustwallet.com/blockchains/${chain}/assets/${getAddress(address)}/logo.png`;
    const res = await this.head(url);
    return res.ok ? url : null;
  }

  protected async head(url: string): Promise<Response> {
    return fetch(url, { method: "HEAD", signal: AbortSignal.timeout(TIMEOUT) });
  }
}
