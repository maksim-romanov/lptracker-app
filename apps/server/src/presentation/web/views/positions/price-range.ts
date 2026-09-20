import { formatPrice } from "@depthly/protocol-math/format";

import type { IPriceRangeVM, TPositionRangeTone } from "./card.vm";
import type { PositionRange, TokensMap } from "#shared/contracts";

// Constants below are calibrated against a rendered bar, not derivable. apps/mobile's
// PriceRangeBar computes the same curve over tick width — ticks are log-price, so the two
// agree; keep them in sync.
const MIN_BAND_WIDTH = 0.2;
const MAX_BAND_WIDTH = 0.7;

// The sigmoid runs over log10(ln(upper / lower)): -1 puts its midpoint at a range about 1.1x
// wide, and a spread of 1 takes a decade of range width to cross most of the band's travel.
const BAND_LOG_CENTER = -1;
const BAND_LOG_SPREAD = 1;

// Below this the range draws the narrowest band. It is a 0.01% span, and nothing tighter is
// separable on a bar a few hundred pixels wide.
const MIN_LOG_SPAN = 1e-4;

// An unbounded side has no price to place, and a bar with an infinite end draws nothing. It
// runs this far from the current price instead — e^89 covers every price an AMM can quote — so
// a range unbounded on both sides puts the thumb dead centre, which is what full range is.
const UNBOUNDED_LOG_SPAN = 88.7;

// How far past its own end the thumb travels once the price has left the range, in multiples of
// the range's width. Without it a price far outside would pin to the edge and stay there.
const OVERSHOOT_SCALE = 1.5;

// A price of zero, or one that failed to parse, has no logarithm — and a NaN percentage reaches
// the DOM as a bar with no thumb at all. Such a price sits at the floor.
const logPrice = (price: string): number => {
  const log = Math.log(Number(price));
  return Number.isFinite(log) ? log : -UNBOUNDED_LOG_SPAN;
};

interface ILogBounds {
  current: number;
  lower: number;
  upper: number;
}

// Inverting the pair is 1/x and ln(1/x) = -ln(x), so it negates all three bounds and swaps
// which of them is the low one.
const logBounds = (range: PositionRange, inverted: boolean): ILogBounds => {
  const current = logPrice(range.current);
  const lower = range.lower === null ? current - UNBOUNDED_LOG_SPAN : logPrice(range.lower);
  const upper = range.upper === null ? current + UNBOUNDED_LOG_SPAN : logPrice(range.upper);
  return inverted ? { current: -current, lower: -upper, upper: -lower } : { current, lower, upper };
};

const logSpan = (bounds: ILogBounds): number => Math.max(MIN_LOG_SPAN, bounds.upper - bounds.lower);

const bandWidthFor = (span: number): number => {
  const sigmoid = 1 / (1 + Math.exp(-(Math.log10(span) - BAND_LOG_CENTER) / BAND_LOG_SPREAD));
  return MIN_BAND_WIDTH + sigmoid * (MAX_BAND_WIDTH - MIN_BAND_WIDTH);
};

const computeRangeBar = (bounds: ILogBounds): Pick<IPriceRangeVM, "bandLeftPct" | "bandWidthPct" | "thumbPct" | "inRange"> => {
  const span = logSpan(bounds);
  const bandWidth = bandWidthFor(span);
  const bandLeft = (1 - bandWidth) / 2;
  const bandRight = bandLeft + bandWidth;
  const currentPos = (bounds.current - bounds.lower) / span;
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

// A distance in price, not a fraction of the range: as a fraction, 10% of a full-range span is a
// fifty-million-fold move, so every full-range position reads as near its bound.
// 0.0488 in natural log is a 5% move, whatever the range's width.
const NEAR_EDGE_LOG = 0.0488;

// On a range narrower than about 6.5% that 5% would swallow the whole thing and the warning
// could never switch off, so on a tight range the edge is a share of the range instead.
const NEAR_EDGE_MAX_SHARE = 0.15;

// Which bound the price is close to, read the way the person is reading the pair — an inversion
// swaps them. Only meaningful for a position whose price is inside its range.
export const deriveRangeTone = (range: PositionRange, inverted = false): TPositionRangeTone => {
  const bounds = logBounds(range, inverted);
  const span = logSpan(bounds);
  const edge = Math.min(NEAR_EDGE_LOG, span * NEAR_EDGE_MAX_SHARE);

  if (bounds.current - bounds.lower <= edge) return "near-lower";
  if (bounds.upper - bounds.current <= edge) return "near-upper";
  return "in-range";
};

const UNBOUNDED_LOW_LABEL = "0";
const UNBOUNDED_HIGH_LABEL = "∞";

const priceLabel = (price: string, inverted: boolean): string => {
  const value = Number(price);
  return formatPrice(inverted ? 1 / value : value);
};

const boundLabel = (bound: string | null, inverted: boolean, unboundedLabel: string): string =>
  bound === null ? unboundedLabel : priceLabel(bound, inverted);

export const derivePriceRangeVM = (range: PositionRange, tokens: TokensMap, inverted: boolean): IPriceRangeVM => {
  const displayBaseRef = inverted ? range.quoteTokenRef : range.baseTokenRef;
  const displayQuoteRef = inverted ? range.baseTokenRef : range.quoteTokenRef;

  return {
    // One over an unbounded price reads as zero, so an inverted upper bound carries the low label.
    minLabel: inverted ? boundLabel(range.upper, true, UNBOUNDED_LOW_LABEL) : boundLabel(range.lower, false, UNBOUNDED_LOW_LABEL),
    currentLabel: priceLabel(range.current, inverted),
    maxLabel: inverted ? boundLabel(range.lower, true, UNBOUNDED_HIGH_LABEL) : boundLabel(range.upper, false, UNBOUNDED_HIGH_LABEL),
    quoteSymbol: tokens[displayQuoteRef]?.symbol ?? displayQuoteRef,
    baseSymbol: tokens[displayBaseRef]?.symbol ?? displayBaseRef,
    ...computeRangeBar(logBounds(range, inverted)),
  };
};
