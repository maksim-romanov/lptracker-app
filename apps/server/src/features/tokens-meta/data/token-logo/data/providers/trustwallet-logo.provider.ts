import { getAddress } from "viem";

import type { LogoProvider } from "../../domain/logo-provider";

const CHAIN_NAMES: Record<number, string> = {
  1: "ethereum",
  10: "optimism",
  56: "smartchain",
  137: "polygon",
  8453: "base",
  42161: "arbitrum",
  43114: "avalanchec",
};

export class TrustWalletLogo implements LogoProvider {
  constructor(
    private chainId: number,
    private address: string,
  ) {}

  async resolve(): Promise<string | null> {
    const chain = CHAIN_NAMES[this.chainId];
    if (!chain) return null;
    return `https://assets-cdn.trustwallet.com/blockchains/${chain}/assets/${getAddress(this.address)}/logo.png`;
  }
}
