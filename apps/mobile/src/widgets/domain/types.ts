export type TWidgetStatus = "in-range" | "out-of-range" | "closed";

export type TWidgetToken = {
  symbol: string;
  iconUrl: string;
  formatted: string;
};

export type TWidgetPair = {
  sym0: string;
  sym1: string;
  icon0: string;
  icon1: string;
};

// Decimal price strings straight off the contract, plus the label the widget draws for each.
// A null bound is unbounded, and renders as 0 or infinity rather than as a missing value.
export type TWidgetPriceBounds = {
  lower: string | null;
  upper: string | null;
  current: string;
  lowerLabel: string;
  upperLabel: string;
  currentLabel: string;
};

// Both readings of the pair, because flipping one is 1 / x and the widget holds no price math.
export type TWidgetPriceRange = {
  quoted: TWidgetPriceBounds;
  inverted: TWidgetPriceBounds;
};

export type TWidgetExtension =
  // `priceRange` is a new key rather than a reshaped `range`: a widget binary older than the
  // snapshot it reads finds the key missing and draws no bar, instead of failing to decode.
  | { type: "uniswap-v3"; feeTierLabel: string; nftTokenId: string; priceRange: TWidgetPriceRange | null }
  | { type: "uniswap-v4"; feeTierLabel: string; poolId: string }
  | { type: "aerodrome"; feeTierLabel: string; positionId: string }
  | { type: "velodrome"; feeTierLabel: string; positionId: string }
  | { type: "unknown"; raw: string };

export type TWidgetPosition = {
  ref: string;
  chainId: number;
  protocol: string;
  protocolLabel: string;
  brandColor: string;
  containerLabel: string;
  status: TWidgetStatus;
  pair: TWidgetPair;
  principals: TWidgetToken[];
  // What a claim transaction would pay out, not fee income — `decreaseLiquidity` credits
  // withdrawn principal into the same balance. Still keyed `fees`: an installed widget binary
  // declares it non-optional on both platforms, so dropping the key fails the whole decode and
  // blanks every position. It can be renamed once both binaries that read the new key have
  // shipped — the condition STATUS_MAP is held on above.
  fees: TWidgetToken[];
  // The contract's `feeAccrual.mode` verbatim, so a redirected balance stays distinguishable
  // from a compounded one. A new key, which an older binary ignores.
  feeMode: string;
  extension: TWidgetExtension;
};

export type TWidgetSnapshot = {
  v: 1;
  writtenAt: number;
  positions: TWidgetPosition[];
};
