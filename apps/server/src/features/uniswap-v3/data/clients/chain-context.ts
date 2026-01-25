import { arbitrum, base, type Chain, mainnet } from "viem/chains";

import { networks } from "../constants/networks";

export class ChainContext {
  static chains = {
    [arbitrum.id]: arbitrum,
    [base.id]: base,
    [mainnet.id]: mainnet,
  } as Record<Chain["id"], Chain>;

  constructor(public readonly chainId: number) {}

  get chain() {
    const chain = ChainContext.chains[this.chainId];
    if (!chain) throw new Error(`Chain ${this.chainId} not found`);
    return chain;
  }

  get rpcUrls(): string[] {
    const urls = networks[this.chain.id as keyof typeof networks]?.rpcUrls.alchemy.http ?? this.chain.rpcUrls.default.http;
    if (!urls) throw new Error(`RPC URLs not found for chain ${this.chain.id}`);
    return urls;
  }

  get graphUrl(): string {
    const url = networks[this.chain.id as keyof typeof networks]?.graph.url;
    if (!url) throw new Error(`Graph URL not found for chain ${this.chain.id}`);
    return url;
  }

  get deployments() {
    const deployments = networks[this.chain.id as keyof typeof networks]?.deployments;
    if (!deployments) throw new Error(`Deployments not found for chain ${this.chain.id}`);
    return deployments;
  }
}
