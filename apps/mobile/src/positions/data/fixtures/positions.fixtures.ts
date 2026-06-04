import type { TPositionVM } from "positions/presentation/components/PositionCard";

export type TokenAmountVM = {
  symbol: string;
  address?: string;
  amount: number;
  usdValue: number;
};

export type PriceRangeVM = {
  min: number;
  current: number;
  max: number;
  quoteSymbol: string;
  baseSymbol: string;
};

export type PositionDetailVM = TPositionVM & {
  price: PriceRangeVM;
  liquidity: { token0: TokenAmountVM; token1: TokenAmountVM };
  unclaimedFees: { token0: TokenAmountVM; token1: TokenAmountVM; totalUsd: number };
  pool: {
    address: string;
    feeTier: number;
    currentTick: number;
  };
};

export const POSITIONS_MOCK: PositionDetailVM[] = [
  {
    id: "1",
    chainId: 1,
    pair: {
      token0: { symbol: "ETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
      token1: { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
    },
    feeBps: 30,
    currentTick: 0,
    tickLower: -200,
    tickUpper: 200,
    feesEarnedUsd: 12.4,
    positionValueUsd: 1280,
    protocol: "uniswap-v3",
    price: { min: 1800, current: 2012.34, max: 2200, quoteSymbol: "USDC", baseSymbol: "ETH" },
    liquidity: {
      token0: { symbol: "ETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", amount: 0.4123, usdValue: 812.5 },
      token1: { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", amount: 467.5, usdValue: 467.5 },
    },
    unclaimedFees: {
      token0: { symbol: "ETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", amount: 0.0042, usdValue: 8.3 },
      token1: { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", amount: 4.1, usdValue: 4.1 },
      totalUsd: 12.4,
    },
    pool: {
      address: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
      feeTier: 30,
      currentTick: 0,
    },
  },
  {
    id: "2",
    chainId: 8453,
    pair: {
      token0: { symbol: "cbBTC", address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf" },
      token1: { symbol: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
    },
    feeBps: 5,
    currentTick: 40,
    tickLower: -100,
    tickUpper: 100,
    feesEarnedUsd: 3.21,
    positionValueUsd: 540,
    protocol: "uniswap-v3",
    price: { min: 58000, current: 63540, max: 68000, quoteSymbol: "USDC", baseSymbol: "cbBTC" },
    liquidity: {
      token0: { symbol: "cbBTC", address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", amount: 0.0051, usdValue: 320.4 },
      token1: { symbol: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", amount: 219.6, usdValue: 219.6 },
    },
    unclaimedFees: {
      token0: { symbol: "cbBTC", address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", amount: 0.00003, usdValue: 1.9 },
      token1: { symbol: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", amount: 1.31, usdValue: 1.31 },
      totalUsd: 3.21,
    },
    pool: {
      address: "0x4c36388be6f416a29c8d8eee81c771ce6be14b18",
      feeTier: 5,
      currentTick: 40,
    },
  },
  {
    id: "3",
    chainId: 42161,
    pair: {
      token0: { symbol: "ARB", address: "0x912CE59144191C1204E64559FE8253a0e49E6548" },
      token1: { symbol: "WETH", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" },
    },
    feeBps: 100,
    currentTick: 300,
    tickLower: -200,
    tickUpper: 200,
    feesEarnedUsd: null,
    positionValueUsd: 240,
    protocol: "uniswap-v3",
    price: { min: 0.00028, current: 0.000385, max: 0.00032, quoteSymbol: "WETH", baseSymbol: "ARB" },
    liquidity: {
      token0: { symbol: "ARB", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", amount: 285.0, usdValue: 184.5 },
      token1: { symbol: "WETH", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", amount: 0.0285, usdValue: 55.5 },
    },
    unclaimedFees: {
      token0: { symbol: "ARB", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", amount: 0, usdValue: 0 },
      token1: { symbol: "WETH", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", amount: 0, usdValue: 0 },
      totalUsd: 0,
    },
    pool: {
      address: "0xc6f780497a95e246eb9449f5e4770916dcd6396a",
      feeTier: 100,
      currentTick: 300,
    },
  },
  {
    id: "4",
    chainId: 10,
    pair: {
      token0: { symbol: "OP", address: "0x4200000000000000000000000000000000000042" },
      token1: { symbol: "USDC", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85" },
    },
    feeBps: 30,
    currentTick: -50,
    tickLower: -200,
    tickUpper: 200,
    feesEarnedUsd: 0.67,
    positionValueUsd: 180,
    protocol: "uniswap-v3",
    price: { min: 1.6, current: 1.78, max: 2.0, quoteSymbol: "USDC", baseSymbol: "OP" },
    liquidity: {
      token0: { symbol: "OP", address: "0x4200000000000000000000000000000000000042", amount: 75.4, usdValue: 96.2 },
      token1: { symbol: "USDC", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", amount: 83.8, usdValue: 83.8 },
    },
    unclaimedFees: {
      token0: { symbol: "OP", address: "0x4200000000000000000000000000000000000042", amount: 0.31, usdValue: 0.4 },
      token1: { symbol: "USDC", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", amount: 0.27, usdValue: 0.27 },
      totalUsd: 0.67,
    },
    pool: {
      address: "0x68f5c0a2de713a54991e01858fd27a3832401849",
      feeTier: 30,
      currentTick: -50,
    },
  },
  {
    id: "5",
    chainId: 137,
    pair: {
      token0: { symbol: "MATIC", address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270" },
      token1: { symbol: "USDC", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" },
    },
    feeBps: 30,
    currentTick: -350,
    tickLower: -200,
    tickUpper: 200,
    feesEarnedUsd: null,
    positionValueUsd: 95,
    protocol: "uniswap-v3",
    price: { min: 0.62, current: 0.58, max: 0.78, quoteSymbol: "USDC", baseSymbol: "MATIC" },
    liquidity: {
      token0: { symbol: "MATIC", address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", amount: 142.0, usdValue: 95.0 },
      token1: { symbol: "USDC", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", amount: 0, usdValue: 0 },
    },
    unclaimedFees: {
      token0: { symbol: "MATIC", address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", amount: 0, usdValue: 0 },
      token1: { symbol: "USDC", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", amount: 0, usdValue: 0 },
      totalUsd: 0,
    },
    pool: {
      address: "0xa374094527e1673a86de625aa59517c5de346d32",
      feeTier: 30,
      currentTick: -350,
    },
  },
];
