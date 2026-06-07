const COINGECKO_PLATFORM_TO_CHAIN_ID: Record<string, number> = {
  ethereum: 1,
  "arbitrum-one": 42161,
  base: 8453,
  "optimistic-ethereum": 10,
  "polygon-pos": 137,
  "binance-smart-chain": 56,
  avalanche: 43114,
};

export const coingeckoChainToChainId = (name: string): number | null => COINGECKO_PLATFORM_TO_CHAIN_ID[name.toLowerCase()] ?? null;
