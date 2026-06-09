import type { NetworkKey } from "@depthly/theme";

export const CHAIN_LOGOS: Record<NetworkKey, number> = {
  ethereum: require("assets/chains/ethereum.png"),
  base: require("assets/chains/base.png"),
  arbitrum: require("assets/chains/arbitrum.png"),
  optimism: require("assets/chains/optimism.png"),
  polygon: require("assets/chains/polygon.png"),
  bnb: require("assets/chains/bnb.png"),
  avalanche: require("assets/chains/avalanche.png"),
};
