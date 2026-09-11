import type { TUniswapV3RangeStatus } from "@depthly/protocol-math/uniswap-v3";

export interface ITokenSideVM {
  tokenRef: string;
  symbol: string;
  // The amount at the token's own display precision, and at a width a list column can
  // hold. The list layouts give every amount one narrow slot; the detail view does not.
  formatted: string;
  formattedShort: string;
  iconUrl: string;
}

export interface IPairSideVM {
  tokenRef: string;
  symbol: string;
  iconUrl: string;
}

export type TPositionRangeTone = "in-range" | "near-lower" | "near-upper" | "out-of-range" | "closed";

export interface ICardVM {
  ref: string;
  nftTokenId: string;
  feeTierLabel: string;
  status: TUniswapV3RangeStatus;
  rangeTone: TPositionRangeTone;
  inverted: boolean;
  chainId: number;
  // Which protocol runs this pool was nowhere in the UI: "v3 / 0.30%" reads as Uniswap by
  // default, and that breaks the moment a position sits on a fork. The slug is what selects
  // the mark's colour, the label is what is always spelled out beside it.
  protocol: { slug: string; label: string };
  pair: { base: IPairSideVM; quote: IPairSideVM };
  principal: ITokenSideVM[];
  fees: ITokenSideVM[];
  priceRange: {
    minLabel: string;
    currentLabel: string;
    maxLabel: string;
    quoteSymbol: string;
    baseSymbol: string;
    // Range-bar layout, percentages 0–100.
    bandLeftPct: number;
    bandWidthPct: number;
    thumbPct: number;
    inRange: boolean;
  };
  poolAddress: string;
  // A position belongs to one of several tracked wallets and was opened at some point; neither
  // was answerable from the detail panel before, and both are what tell two otherwise
  // identical positions apart.
  ownerAddress: string;
  openedAtLabel: string | null;
  // Whether the fee column has earned anything. Derived from the raw balances rather than from
  // the formatted strings, which round a dust amount to "0.0000" and would read as nothing.
  hasUnclaimedFees: boolean;
}

// The list leads with the positions that need a decision and trails with the ones that cannot
// need one. Ties break on ref so the order is stable across polls.
const URGENCY: Record<TPositionRangeTone, number> = {
  "out-of-range": 0,
  "near-lower": 1,
  "near-upper": 1,
  "in-range": 2,
  closed: 3,
};

export const sortCardsByUrgency = (cards: ICardVM[]): ICardVM[] =>
  [...cards].sort((a, b) => URGENCY[a.rangeTone] - URGENCY[b.rangeTone] || a.ref.localeCompare(b.ref));
