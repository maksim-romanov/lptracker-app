import type { Address } from "viem";
import { arbitrum, base, mainnet } from "viem/chains";

const ARBITRUM_NETWORK = {
  id: arbitrum.id,

  rpcUrls: {
    alchemy: {
      http: ["https://arb-mainnet.g.alchemy.com/v2/0720daf1848399dae566c9ab9efcb85e"],
    },
  },

  graph: {
    url: "https://api.studio.thegraph.com/query/120331/uniswap-v-3-graph/v0.0.33",
  },

  deployments: {
    NonfungiblePositionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" as Address,
    UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984" as Address,
  },
};

const MAINNET_NETWORK = {
  id: mainnet.id,

  rpcUrls: {
    alchemy: {
      http: ["https://eth-mainnet.g.alchemy.com/v2/0720daf1848399dae566c9ab9efcb85e"],
    },
  },

  graph: {
    url: "https://api.studio.thegraph.com/query/120331/uniswap-v-3-mainnet/v0.0.2",
  },

  deployments: {
    NonfungiblePositionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" as Address,
    UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984" as Address,
  },
};

const BASE_NETWORK = {
  id: base.id,

  rpcUrls: {
    alchemy: {
      http: ["https://base-mainnet.g.alchemy.com/v2/0720daf1848399dae566c9ab9efcb85e"],
    },
  },

  graph: {
    url: "https://api.studio.thegraph.com/query/120331/uniswap-v-3-base/v0.0.3",
  },

  deployments: {
    NonfungiblePositionManager: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1" as Address,
    UniswapV3Factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD" as Address,
  },
};

export const networks = {
  [arbitrum.id]: ARBITRUM_NETWORK,
  [mainnet.id]: MAINNET_NETWORK,
  [base.id]: BASE_NETWORK,
} as const;
