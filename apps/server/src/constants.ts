import { Address } from "viem";
import { arbitrum } from "viem/chains";

export const GRAPH_API_URL =
  "https://api.studio.thegraph.com/query/120331/uniswap-v-3-graph/v0.0.32";

const ARBITRUM_NETWORK = {
  id: arbitrum.id,

  alchemy: {
    rpcUrl: "https://arb-mainnet.g.alchemy.com/v2/v_j-SYka_HKgzKcNAiLh_UpZzZFbl03O",
  },

  deployments: {
    NonfungiblePositionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" as Address,
    UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984" as Address
  }
}

export const networks = {
  'arbitrum': ARBITRUM_NETWORK,
}

export const Q128 = 2n ** 128n
export const Q256 = 2n ** 256n