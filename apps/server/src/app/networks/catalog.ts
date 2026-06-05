import { config } from "shared/config";
import type { Network } from "shared/contracts";
import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon } from "viem/chains";

const buildNetworkIconUrl = (chainId: number): string => `${config.api.tokensData.baseUrl}/v1/chains/${chainId}/icon.png`;

interface NetworkSeed {
  chainId: number;
  slug: string;
  name: string;
  shortName: string;
  nativeCurrency: { symbol: string; name: string; decimals: number };
  explorerUrl: string;
}

const networkSeeds: NetworkSeed[] = [
  {
    chainId: mainnet.id,
    slug: "ethereum",
    name: "Ethereum",
    shortName: "ETH",
    nativeCurrency: { symbol: "ETH", name: "Ether", decimals: 18 },
    explorerUrl: "https://etherscan.io",
  },
  {
    chainId: base.id,
    slug: "base",
    name: "Base",
    shortName: "BASE",
    nativeCurrency: { symbol: "ETH", name: "Ether", decimals: 18 },
    explorerUrl: "https://basescan.org",
  },
  {
    chainId: arbitrum.id,
    slug: "arbitrum",
    name: "Arbitrum",
    shortName: "ARB",
    nativeCurrency: { symbol: "ETH", name: "Ether", decimals: 18 },
    explorerUrl: "https://arbiscan.io",
  },
  {
    chainId: optimism.id,
    slug: "optimism",
    name: "Optimism",
    shortName: "OP",
    nativeCurrency: { symbol: "ETH", name: "Ether", decimals: 18 },
    explorerUrl: "https://optimistic.etherscan.io",
  },
  {
    chainId: polygon.id,
    slug: "polygon",
    name: "Polygon",
    shortName: "POL",
    nativeCurrency: { symbol: "POL", name: "Polygon", decimals: 18 },
    explorerUrl: "https://polygonscan.com",
  },
  {
    chainId: bsc.id,
    slug: "bnb",
    name: "BNB Chain",
    shortName: "BNB",
    nativeCurrency: { symbol: "BNB", name: "BNB", decimals: 18 },
    explorerUrl: "https://bscscan.com",
  },
  {
    chainId: avalanche.id,
    slug: "avalanche",
    name: "Avalanche",
    shortName: "AVAX",
    nativeCurrency: { symbol: "AVAX", name: "Avalanche", decimals: 18 },
    explorerUrl: "https://snowtrace.io",
  },
];

export const networkCatalog: Network[] = networkSeeds.map((seed) => ({
  ...seed,
  iconUrl: buildNetworkIconUrl(seed.chainId),
}));

const byChainId = new Map<number, Network>(networkCatalog.map((n) => [n.chainId, n]));

export const isKnownChainId = (chainId: number): boolean => byChainId.has(chainId);

export const knownChainIds = (): number[] => [...byChainId.keys()];

export const networkByChainId = (chainId: number): Network | undefined => byChainId.get(chainId);
