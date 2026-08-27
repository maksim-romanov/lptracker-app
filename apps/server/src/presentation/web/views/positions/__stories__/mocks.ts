import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

const basePair: ICardVM["pair"] = {
  base: { tokenRef: "1:0xweth", symbol: "WETH", iconUrl: "https://assets.uniswap.org/weth.png" },
  quote: { tokenRef: "1:0xusdc", symbol: "USDC", iconUrl: "https://assets.uniswap.org/usdc.png" },
};

const basePriceRange: ICardVM["priceRange"] = {
  minLabel: "1,800",
  currentLabel: "2,000",
  maxLabel: "2,200",
  quoteSymbol: "USDC",
  baseSymbol: "WETH",
  bandLeftPct: 15,
  bandWidthPct: 70,
  thumbPct: 50,
  inRange: true,
};

const baseFees: ICardVM["fees"] = [
  { tokenRef: "1:0xweth", symbol: "WETH", formatted: "0.012", iconUrl: "https://assets.uniswap.org/weth.png" },
  { tokenRef: "1:0xusdc", symbol: "USDC", formatted: "8.40", iconUrl: "https://assets.uniswap.org/usdc.png" },
];

export const inRange: ICardVM = {
  ref: "uniswap-v3:1:1001",
  nftTokenId: "1001",
  feeTierLabel: "0.3%",
  status: "in-range",
  inverted: false,
  chainId: 1,
  protocolLabel: "Uniswap V3",
  pair: basePair,
  principal: [
    { tokenRef: "1:0xweth", symbol: "WETH", formatted: "1.24", iconUrl: basePair.base.iconUrl },
    { tokenRef: "1:0xusdc", symbol: "USDC", formatted: "2,480.00", iconUrl: basePair.quote.iconUrl },
  ],
  fees: baseFees,
  priceRange: basePriceRange,
  poolAddress: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
};

export const outOfRange: ICardVM = {
  ...inRange,
  ref: "uniswap-v3:1:1002",
  nftTokenId: "1002",
  status: "out-of-range",
  priceRange: { ...basePriceRange, currentLabel: "2,350", bandLeftPct: 5, bandWidthPct: 40, thumbPct: 92, inRange: false },
};

export const closed: ICardVM = {
  ...inRange,
  ref: "uniswap-v3:1:1003",
  nftTokenId: "1003",
  status: "closed",
  fees: [],
  principal: [],
};

export const noFees: ICardVM = {
  ...inRange,
  ref: "uniswap-v3:1:1004",
  nftTokenId: "1004",
  fees: [],
};

export const longAddressNoIcon: ICardVM = {
  ...inRange,
  ref: "uniswap-v3:8453:1005",
  nftTokenId: "1005",
  chainId: 8453,
  pair: {
    base: { tokenRef: "8453:0xa", symbol: "WETH", iconUrl: "" },
    quote: { tokenRef: "8453:0xb", symbol: "USDC", iconUrl: "" },
  },
  poolAddress: "0x1234567890abcdef1234567890abcdef12345678",
};
