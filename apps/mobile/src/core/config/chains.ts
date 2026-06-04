import { type NetworkKey, networkColors } from "@mars-909/theme";
import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon } from "viem/chains";

export type ChainConfig = {
  id: number;
  key: NetworkKey;
  label: string;
  fullName: string;
};

export const CHAINS = {
  ethereum: { id: mainnet.id, key: "ethereum", label: "ETH", fullName: "Ethereum" },
  base: { id: base.id, key: "base", label: "BASE", fullName: "Base" },
  arbitrum: { id: arbitrum.id, key: "arbitrum", label: "ARB", fullName: "Arbitrum" },
  optimism: { id: optimism.id, key: "optimism", label: "OP", fullName: "Optimism" },
  polygon: { id: polygon.id, key: "polygon", label: "POL", fullName: "Polygon" },
  bnb: { id: bsc.id, key: "bnb", label: "BNB", fullName: "BNB Chain" },
  avalanche: { id: avalanche.id, key: "avalanche", label: "AVAX", fullName: "Avalanche" },
} as const satisfies Record<NetworkKey, ChainConfig>;

export type ChainId = (typeof CHAINS)[keyof typeof CHAINS]["id"];

export const CHAIN_BY_ID = new Map<number, ChainConfig>(Object.values(CHAINS).map((chain) => [chain.id, chain]));

export const chainColor = (chainId: number) => {
  const chain = CHAIN_BY_ID.get(chainId);
  return chain ? networkColors[chain.key] : undefined;
};
