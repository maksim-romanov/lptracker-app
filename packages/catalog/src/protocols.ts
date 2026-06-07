import type { IProtocolMeta } from "./types";

export const PROTOCOLS_META = {
  "uniswap-v3": {
    slug: "uniswap-v3",
    version: "3",
    label: "Uniswap V3",
    brandColor: "#FF007A",
    supportedChainIds: [1, 8453, 42161] as const,
    capabilities: ["concentrated-liquidity", "nft-positions", "claim-fees"] as const,
    extensionVersion: 1,
  },
} as const satisfies Record<string, IProtocolMeta>;

export type TKnownProtocolSlug = keyof typeof PROTOCOLS_META;
