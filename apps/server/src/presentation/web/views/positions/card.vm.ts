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

export interface IPriceRangeVM {
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
}

// "drained" is not a flavour of closed: the liquidity is gone but the collectable balance is
// still there and one transaction takes it.
export type TPositionRangeTone = "in-range" | "near-lower" | "near-upper" | "out-of-range" | "drained" | "closed";

export interface ICardVM {
  ref: string;
  rangeTone: TPositionRangeTone;
  inverted: boolean;
  chainId: number;
  // The slug selects the mark's colour; the label is spelled out beside it.
  protocol: { slug: string; label: string };
  // A short qualifier for the venue the position sits in — "0.3%" for a v3 fee tier, "Volatile"
  // for an Aerodrome pool. Null for a protocol whose venue needs no qualifier.
  venueLabel: string | null;
  // How the protocol's own interface names this position, and where it shows it. A v3 position
  // is an NFT with an id; a fungible LP token is neither named nor separately addressable.
  positionLabel: string | null;
  externalUrl: string | null;
  pair: { base: IPairSideVM; quote: IPairSideVM };
  principal: ITokenSideVM[];
  // What a claim transaction would pay out, which includes withdrawn principal — not fee income.
  owed: ITokenSideVM[];
  // Null for a position with no price range at all — a classic constant-product LP is in every
  // price, so a bar showing where the price sits inside its range would be showing nothing.
  priceRange: IPriceRangeVM | null;
  poolAddress: string;
  ownerAddress: string;
  openedAtLabel: string | null;
  // Whether the owed column holds more than dust. Derived from the raw balances rather than
  // from the formatted strings, which round a dust amount to "0.0000" and would read as nothing.
  hasUnclaimedBalance: boolean;
  // The contract's `feeAccrual.mode` verbatim. A position whose read failed lists no owed token —
  // the invariant in shared/contracts forbids one — so an empty column is indistinguishable from
  // a zero balance unless the card carries this.
  feeMode: string;
}

// Ordered by the decision each position asks for, not by its health: drained outranks in-range
// because collecting is an action and sitting in range is not. Ties break on ref so the order is
// stable across polls.
const URGENCY: Record<TPositionRangeTone, number> = {
  "out-of-range": 0,
  "near-lower": 1,
  "near-upper": 1,
  drained: 2,
  "in-range": 3,
  closed: 4,
};

export const sortCardsByUrgency = (cards: ICardVM[]): ICardVM[] =>
  [...cards].sort((a, b) => URGENCY[a.rangeTone] - URGENCY[b.rangeTone] || a.ref.localeCompare(b.ref));
