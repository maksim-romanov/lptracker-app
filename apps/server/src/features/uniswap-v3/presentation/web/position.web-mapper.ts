import { formatPrice, formatTokenAmount, formatTokenAmountShort } from "@depthly/protocol-math/format";
import { deriveStatus, priceRangeFromTicks, type TUniswapV3RangeStatus } from "@depthly/protocol-math/uniswap-v3";

import { UNISWAP_V3_EXTENSION_TYPE, type UniswapV3Extension } from "../schemas/extension.schema";
import type { Position, PositionToken, TokensMap } from "#shared/contracts";

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
  protocolLabel: string;
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
}

const tokenSide = (positionToken: PositionToken, tokens: TokensMap): ITokenSideVM => {
  const meta = tokens[positionToken.tokenRef];
  return {
    tokenRef: positionToken.tokenRef,
    symbol: meta?.symbol ?? positionToken.tokenRef,
    formatted: formatTokenAmount(positionToken.balance.formatted, meta?.displayDecimals),
    formattedShort: formatTokenAmountShort(positionToken.balance.formatted),
    iconUrl: meta?.iconUrl ?? "",
  };
};

// Both amount lists are rendered as bare numbers whose slots the pair names, so they
// have to follow the pair through an inversion or the two swap places without it.
const displayOrder = (positionTokens: PositionToken[], inverted: boolean): PositionToken[] =>
  inverted ? [positionTokens[1], positionTokens[0]].filter((token): token is PositionToken => Boolean(token)) : positionTokens;

const derivePair = (principals: PositionToken[], tokens: TokensMap, inverted: boolean): ICardVM["pair"] => {
  const baseRef = principals[inverted ? 1 : 0]?.tokenRef ?? "";
  const quoteRef = principals[inverted ? 0 : 1]?.tokenRef ?? "";
  const baseMeta = tokens[baseRef];
  const quoteMeta = tokens[quoteRef];
  return {
    base: { tokenRef: baseRef, symbol: baseMeta?.symbol ?? baseRef, iconUrl: baseMeta?.iconUrl ?? "" },
    quote: { tokenRef: quoteRef, symbol: quoteMeta?.symbol ?? quoteRef, iconUrl: quoteMeta?.iconUrl ?? "" },
  };
};

// Ported 1:1 from apps/mobile PriceRangeBar — keep the two in sync.
const MIN_BAND_WIDTH = 0.2;
const MAX_BAND_WIDTH = 0.7;
const BAND_LOG_CENTER = 3.0;
const BAND_LOG_SPREAD = 1.0;
const OVERSHOOT_SCALE = 1.5;

const bandWidthFor = (tickWidth: number): number => {
  const logTicks = Math.log10(Math.max(1, tickWidth));
  const sigmoid = 1 / (1 + Math.exp(-(logTicks - BAND_LOG_CENTER) / BAND_LOG_SPREAD));
  return MIN_BAND_WIDTH + sigmoid * (MAX_BAND_WIDTH - MIN_BAND_WIDTH);
};

const computeRangeBar = (
  currentTick: number,
  tickLower: number,
  tickUpper: number,
  inverted: boolean,
): { bandLeftPct: number; bandWidthPct: number; thumbPct: number; inRange: boolean } => {
  const cur = inverted ? -currentTick : currentTick;
  const lower = inverted ? -tickUpper : tickLower;
  const upper = inverted ? -tickLower : tickUpper;

  const rangeWidth = Math.max(1, upper - lower);
  const bandWidth = bandWidthFor(rangeWidth);
  const bandLeft = (1 - bandWidth) / 2;
  const bandRight = bandLeft + bandWidth;
  const currentPos = (cur - lower) / rangeWidth;
  const inRange = currentPos >= 0 && currentPos <= 1;

  let thumb: number;
  if (inRange) {
    thumb = bandLeft + currentPos * bandWidth;
  } else if (currentPos < 0) {
    thumb = bandLeft - bandLeft * (1 - Math.exp(currentPos / OVERSHOOT_SCALE));
  } else {
    thumb = bandRight + (1 - bandRight) * (1 - Math.exp(-(currentPos - 1) / OVERSHOOT_SCALE));
  }

  return { bandLeftPct: bandLeft * 100, bandWidthPct: bandWidth * 100, thumbPct: thumb * 100, inRange };
};

// Ticks are log-price, so a fixed fraction of the band is a fixed proportional move of the
// price — the same warning distance whether the range is wide or narrow.
const NEAR_EDGE_FRACTION = 0.1;

export const deriveRangeTone = (status: TUniswapV3RangeStatus, bar: ICardVM["priceRange"]): TPositionRangeTone => {
  if (status !== "in-range") return status;
  const positionInBand = (bar.thumbPct - bar.bandLeftPct) / bar.bandWidthPct;
  if (positionInBand <= NEAR_EDGE_FRACTION) return "near-lower";
  if (positionInBand >= 1 - NEAR_EDGE_FRACTION) return "near-upper";
  return "in-range";
};

const derivePriceRange = (principals: PositionToken[], ext: UniswapV3Extension, tokens: TokensMap, inverted: boolean): ICardVM["priceRange"] => {
  const baseRef = principals[0]?.tokenRef ?? "";
  const quoteRef = principals[1]?.tokenRef ?? "";
  const baseDecimals = tokens[baseRef]?.decimals ?? 18;
  const quoteDecimals = tokens[quoteRef]?.decimals ?? 18;

  const { min, current, max } = priceRangeFromTicks({
    tickLower: ext.tickLower,
    tickUpper: ext.tickUpper,
    currentTick: ext.pool.currentTick,
    baseDecimals,
    quoteDecimals,
    inverted,
  });

  const displayQuoteRef = inverted ? baseRef : quoteRef;
  const displayBaseRef = inverted ? quoteRef : baseRef;
  const bar = computeRangeBar(ext.pool.currentTick, ext.tickLower, ext.tickUpper, inverted);
  return {
    minLabel: formatPrice(min),
    currentLabel: formatPrice(current),
    maxLabel: formatPrice(max),
    quoteSymbol: tokens[displayQuoteRef]?.symbol ?? displayQuoteRef,
    baseSymbol: tokens[displayBaseRef]?.symbol ?? displayBaseRef,
    ...bar,
  };
};

export const mapPositionToCardVM = (position: Position, tokens: TokensMap, opts: { inverted: boolean }): ICardVM => {
  if (position.extension.type !== UNISWAP_V3_EXTENSION_TYPE) {
    throw new Error(`mapPositionToCardVM: expected uniswap-v3 extension, got "${position.extension.type}"`);
  }
  const ext = position.extension as unknown as UniswapV3Extension;
  const { inverted } = opts;

  const principals = position.tokens.filter((t) => t.role === "principal");
  const status = deriveStatus(position.status.state);
  const priceRange = derivePriceRange(principals, ext, tokens, inverted);

  return {
    ref: position.ref,
    nftTokenId: ext.nftTokenId,
    feeTierLabel: ext.feeTierLabel,
    status,
    rangeTone: deriveRangeTone(status, priceRange),
    inverted,
    chainId: Number(position.ref.split(":")[1]),
    protocolLabel: "Uniswap V3",
    pair: derivePair(principals, tokens, inverted),
    principal: displayOrder(principals, inverted).map((t) => tokenSide(t, tokens)),
    fees: displayOrder(
      position.tokens.filter((t) => t.role === "fee"),
      inverted,
    ).map((t) => tokenSide(t, tokens)),
    priceRange,
    poolAddress: ext.pool.address,
  };
};
