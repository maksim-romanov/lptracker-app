import type { ProtocolEntry } from "./types";
import { uniswapV3ProtocolEntry } from "./uniswap-v3.entry";

const entries: ProtocolEntry[] = [uniswapV3ProtocolEntry];

export const protocolRegistry = {
  all(): readonly ProtocolEntry[] {
    return entries;
  },

  bySlug(slug: string): ProtocolEntry | undefined {
    return entries.find((entry) => entry.slug === slug);
  },

  slugs(): string[] {
    return entries.map((entry) => entry.slug);
  },

  supportsChain(slug: string, chainId: number): boolean {
    const entry = this.bySlug(slug);
    return entry ? entry.supportedChainIds.includes(chainId) : false;
  },

  knownChainIds(): number[] {
    const set = new Set<number>();
    for (const entry of entries) {
      for (const id of entry.supportedChainIds) set.add(id);
    }
    return [...set];
  },
};

export type ProtocolRegistry = typeof protocolRegistry;
