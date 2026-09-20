import type { ICardVM, IPriceRangeVM } from "../card.vm";

const basePair: ICardVM["pair"] = {
  base: { tokenRef: "1:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", symbol: "WETH", iconUrl: "https://assets.uniswap.org/weth.png" },
  quote: { tokenRef: "1:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC", iconUrl: "https://assets.uniswap.org/usdc.png" },
};

const basePriceRange: IPriceRangeVM = {
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

const baseOwed: ICardVM["owed"] = [
  {
    tokenRef: "1:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    symbol: "WETH",
    formatted: "0.008439",
    formattedShort: "0.0084",
    iconUrl: "https://assets.uniswap.org/weth.png",
  },
  {
    tokenRef: "1:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    symbol: "USDC",
    formatted: "23.54",
    formattedShort: "23.54",
    iconUrl: "https://assets.uniswap.org/usdc.png",
  },
];

export const inRange: ICardVM = {
  ref: "uniswap-v3:1:1001",
  rangeTone: "in-range",
  inverted: false,
  chainId: 1,
  protocol: { slug: "uniswap-v3", label: "Uniswap V3" },
  venueLabel: "0.3%",
  positionLabel: "#1001",
  externalUrl: "https://app.uniswap.org/positions/v3/ethereum/1001",
  pair: basePair,
  principal: [
    {
      tokenRef: "1:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      symbol: "WETH",
      formatted: "5.165909",
      formattedShort: "5.1659",
      iconUrl: basePair.base.iconUrl,
    },
    {
      tokenRef: "1:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      symbol: "USDC",
      formatted: "3,707.59",
      formattedShort: "3,707.59",
      iconUrl: basePair.quote.iconUrl,
    },
  ],
  owed: baseOwed,
  priceRange: basePriceRange,
  poolAddress: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
  ownerAddress: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
  openedAtLabel: "Mar 12, 2026",
  hasUnclaimedBalance: true,
  feeMode: "claimable",
};

export const outOfRange: ICardVM = {
  ...inRange,
  ref: "uniswap-v3:1:1002",
  positionLabel: "#1002",
  rangeTone: "out-of-range",
  priceRange: { ...basePriceRange, currentLabel: "2,350", bandLeftPct: 5, bandWidthPct: 40, thumbPct: 92, inRange: false },
};

// An emptied position still lists both principal tokens — the v3 mapper always emits one entry
// per pool token, at zero. Dropping them would hit the "holds no tokens" guard and hide the whole
// amounts table, which is not what either of these states looks like.
const drainedPrincipal: ICardVM["principal"] = inRange.principal.map((token) => ({ ...token, formatted: "0", formattedShort: "0" }));

export const closed: ICardVM = {
  ...inRange,
  ref: "uniswap-v3:1:1003",
  positionLabel: "#1003",
  rangeTone: "closed",
  owed: [],
  principal: drainedPrincipal,
  hasUnclaimedBalance: false,
};

// Has to stay on the board: there is one transaction left to make.
export const drained: ICardVM = {
  ...inRange,
  ref: "uniswap-v3:1:1008",
  positionLabel: "#1008",
  rangeTone: "drained",
  principal: drainedPrincipal,
};

export const nothingOwed: ICardVM = {
  ...inRange,
  ref: "uniswap-v3:1:1004",
  positionLabel: "#1004",
  owed: [],
  hasUnclaimedBalance: false,
};

// The pinned read reverted, so the position lists no owed token. It has to say the amount is
// missing, not that there is nothing to collect.
export const owedUnknown: ICardVM = {
  ...inRange,
  ref: "uniswap-v3:1:1009",
  positionLabel: "#1009",
  owed: [],
  hasUnclaimedBalance: false,
  feeMode: "unknown",
};

export const longAddressNoIcon: ICardVM = {
  ...inRange,
  ref: "uniswap-v3:8453:1005",
  positionLabel: "#1005",
  chainId: 8453,
  pair: {
    base: { tokenRef: "8453:0xa", symbol: "WETH", iconUrl: "" },
    quote: { tokenRef: "8453:0xb", symbol: "USDC", iconUrl: "" },
  },
  poolAddress: "0x1234567890abcdef1234567890abcdef12345678",
};

export const nearUpperBound: ICardVM = {
  ...inRange,
  ref: "uniswap-v3:1:1006",
  positionLabel: "#1006",
  rangeTone: "near-upper",
  priceRange: { ...basePriceRange, currentLabel: "2,170", thumbPct: 80 },
};

export const nearLowerBound: ICardVM = {
  ...inRange,
  ref: "uniswap-v3:1:1007",
  positionLabel: "#1007",
  rangeTone: "near-lower",
  priceRange: { ...basePriceRange, currentLabel: "1,830", thumbPct: 20 },
};

// A classic constant-product LP: a fungible ERC-20 position, so there is no NFT to name, no
// price range to draw and no fee tier to print.
export const fungibleLp: ICardVM = {
  ...inRange,
  ref: "aerodrome:8453:0xpool-0xowner",
  chainId: 8453,
  protocol: { slug: "aerodrome", label: "Aerodrome" },
  venueLabel: null,
  positionLabel: null,
  externalUrl: null,
  priceRange: null,
  owed: [],
  hasUnclaimedBalance: false,
};
