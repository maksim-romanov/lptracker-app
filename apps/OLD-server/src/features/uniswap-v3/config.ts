const ARBITRUM_NETWORK = {
	chainId: 42161,
	chainName: "Arbitrum",
	graphqlUrl: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-arbitrum",
	contracts: {
		factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
		positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
		quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
	},
	blockExplorer: "https://arbiscan.io",
} as const;

const ETHEREUM_NETWORK = {
	chainId: 1,
	chainName: "Ethereum",
	graphqlUrl: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
	contracts: {
		factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
		positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
		quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
	},
	blockExplorer: "https://etherscan.io",
} as const;

export const networks = {
	arbitrum: ARBITRUM_NETWORK,
	ethereum: ETHEREUM_NETWORK,
} as const;
