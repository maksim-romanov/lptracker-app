import { arbitrum, base, mainnet } from "viem/chains";

export const CHAINS = {
  ethereum: { id: mainnet.id, label: "ETH", color: "#627EEA" },
  base: { id: base.id, label: "BASE", color: "#0052FF" },
  arbitrum: { id: arbitrum.id, label: "ARB", color: "#28A0F0" },
} as const;

export type ChainId = (typeof CHAINS)[keyof typeof CHAINS]["id"];

export const CHAIN_BY_ID = new Map(Object.values(CHAINS).map((chain) => [chain.id, chain]));
