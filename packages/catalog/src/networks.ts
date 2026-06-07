import type { INetworkEntry } from "./types";

export const NETWORKS = [
  {
    chainId: 1,
    slug: "ethereum",
    name: "Ethereum",
    shortName: "ETH",
    nativeCurrency: { symbol: "ETH", name: "Ether", decimals: 18 },
    explorerUrl: "https://etherscan.io",
  },
  {
    chainId: 8453,
    slug: "base",
    name: "Base",
    shortName: "BASE",
    nativeCurrency: { symbol: "ETH", name: "Ether", decimals: 18 },
    explorerUrl: "https://basescan.org",
  },
  {
    chainId: 42161,
    slug: "arbitrum",
    name: "Arbitrum",
    shortName: "ARB",
    nativeCurrency: { symbol: "ETH", name: "Ether", decimals: 18 },
    explorerUrl: "https://arbiscan.io",
  },
  {
    chainId: 10,
    slug: "optimism",
    name: "Optimism",
    shortName: "OP",
    nativeCurrency: { symbol: "ETH", name: "Ether", decimals: 18 },
    explorerUrl: "https://optimistic.etherscan.io",
  },
  {
    chainId: 137,
    slug: "polygon",
    name: "Polygon",
    shortName: "POL",
    nativeCurrency: { symbol: "POL", name: "Polygon", decimals: 18 },
    explorerUrl: "https://polygonscan.com",
  },
  {
    chainId: 56,
    slug: "bnb",
    name: "BNB Chain",
    shortName: "BNB",
    nativeCurrency: { symbol: "BNB", name: "BNB", decimals: 18 },
    explorerUrl: "https://bscscan.com",
  },
  {
    chainId: 43114,
    slug: "avalanche",
    name: "Avalanche",
    shortName: "AVAX",
    nativeCurrency: { symbol: "AVAX", name: "Avalanche", decimals: 18 },
    explorerUrl: "https://snowtrace.io",
  },
] as const satisfies ReadonlyArray<INetworkEntry>;

export type TKnownChainId = (typeof NETWORKS)[number]["chainId"];
