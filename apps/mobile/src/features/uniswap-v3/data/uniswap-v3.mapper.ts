import numbro from "numbro";
import type { TPositionByExt, TTokensMap } from "positions/domain/types";

import type { TUniswapV3Pair, TUniswapV3PriceRange, TUniswapV3RangeStatus, TUniswapV3TokenSide, TUniswapV3VM } from "../domain/uniswap-v3.vm";

const STATUS_MAP: Record<string, TUniswapV3RangeStatus> = {
  "in-range": "in-range",
  "out-of-range": "out-of-range",
  closed: "closed",
  open: "in-range",
};

function deriveStatus(state: string): TUniswapV3RangeStatus {
  return STATUS_MAP[state] ?? "in-range";
}

const DEFAULT_MANTISSA = 6;
const COMPACT_THRESHOLD = 1e6;

function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${numbro(value / 1e12).format({ mantissa: 2, trimMantissa: true })}T`;
  if (abs >= 1e9) return `${numbro(value / 1e9).format({ mantissa: 2, trimMantissa: true })}B`;
  if (abs >= 1e6) return `${numbro(value / 1e6).format({ mantissa: 2, trimMantissa: true })}M`;
  return `${numbro(value / 1e3).format({ mantissa: 2, trimMantissa: true })}K`;
}

export function formatTokenAmount(raw: string, displayDecimals?: number): string {
  const value = Number(raw);
  if (!Number.isFinite(value) || value === 0) return "0";
  const abs = Math.abs(value);
  const mantissa = displayDecimals ?? DEFAULT_MANTISSA;
  if (abs < 10 ** -mantissa) return `< 0.${"0".repeat(mantissa - 1)}1`;
  if (abs >= COMPACT_THRESHOLD) return formatCompact(value);
  return numbro(value).format({ thousandSeparated: true, mantissa, trimMantissa: true });
}

function tokenSide(positionToken: TPositionByExt<"uniswap-v3">["tokens"][number], tokens: TTokensMap): TUniswapV3TokenSide {
  const meta = tokens[positionToken.tokenRef];
  return {
    tokenRef: positionToken.tokenRef,
    symbol: meta?.symbol ?? positionToken.tokenRef,
    formatted: formatTokenAmount(positionToken.balance.formatted, meta?.displayDecimals),
    iconUrl: meta?.iconUrl ?? "",
  };
}

function tickToPrice(tick: number, baseDecimals: number, quoteDecimals: number): number {
  return Math.exp(tick * Math.log(1.0001) + (baseDecimals - quoteDecimals) * Math.log(10));
}

export function formatPrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) return "—";
  if (price >= 1e15) return "∞";
  if (price <= 1e-15) return "0";
  if (price >= COMPACT_THRESHOLD) return formatCompact(price);
  if (price >= 1000) return numbro(price).format({ thousandSeparated: true, mantissa: 2 });
  if (price >= 1) return numbro(price).format({ thousandSeparated: true, mantissa: 4 });
  if (price >= 0.0001) return numbro(price).format({ mantissa: 6 });
  if (price >= 0.000001) return numbro(price).format({ mantissa: 8 });
  return price.toExponential(2);
}

function derivePair(position: TPositionByExt<"uniswap-v3">, tokens: TTokensMap, inverted: boolean): TUniswapV3Pair {
  const principals = position.tokens.filter((t) => t.role === "principal");
  const baseRef = principals[inverted ? 1 : 0]?.tokenRef ?? "";
  const quoteRef = principals[inverted ? 0 : 1]?.tokenRef ?? "";
  const baseMeta = tokens[baseRef];
  const quoteMeta = tokens[quoteRef];
  return {
    base: { tokenRef: baseRef, symbol: baseMeta?.symbol ?? baseRef, iconUrl: baseMeta?.iconUrl ?? "" },
    quote: { tokenRef: quoteRef, symbol: quoteMeta?.symbol ?? quoteRef, iconUrl: quoteMeta?.iconUrl ?? "" },
  };
}

function derivePriceRange(position: TPositionByExt<"uniswap-v3">, tokens: TTokensMap, inverted: boolean): TUniswapV3PriceRange {
  const principals = position.tokens.filter((t) => t.role === "principal");
  const baseRef = principals[0]?.tokenRef ?? "";
  const quoteRef = principals[1]?.tokenRef ?? "";

  const baseDecimals = tokens[baseRef]?.decimals ?? 18;
  const quoteDecimals = tokens[quoteRef]?.decimals ?? 18;

  const lowerPrice = tickToPrice(position.extension.tickLower, baseDecimals, quoteDecimals);
  const currentPrice = tickToPrice(position.extension.pool.currentTick, baseDecimals, quoteDecimals);
  const upperPrice = tickToPrice(position.extension.tickUpper, baseDecimals, quoteDecimals);

  const minPrice = inverted ? 1 / upperPrice : lowerPrice;
  const maxPrice = inverted ? 1 / lowerPrice : upperPrice;
  const midPrice = inverted ? 1 / currentPrice : currentPrice;

  const displayQuoteRef = inverted ? baseRef : quoteRef;
  const displayBaseRef = inverted ? quoteRef : baseRef;

  return {
    minLabel: formatPrice(minPrice),
    currentLabel: formatPrice(midPrice),
    maxLabel: formatPrice(maxPrice),
    quoteSymbol: tokens[displayQuoteRef]?.symbol ?? displayQuoteRef,
    baseSymbol: tokens[displayBaseRef]?.symbol ?? displayBaseRef,
  };
}

export function mapToVm(position: TPositionByExt<"uniswap-v3">, tokens: TTokensMap, inverted: boolean = false): TUniswapV3VM {
  const principals = position.tokens.filter((t) => t.role === "principal");
  const orderedPrincipals = inverted ? [principals[1], principals[0]].filter((t): t is (typeof principals)[number] => Boolean(t)) : principals;

  return {
    nftTokenId: position.extension.nftTokenId,
    feeTierLabel: position.extension.feeTierLabel,
    status: deriveStatus(position.status.state),
    pair: derivePair(position, tokens, inverted),
    principal: orderedPrincipals.map((t) => tokenSide(t, tokens)),
    fees: position.tokens.filter((t) => t.role === "fee").map((t) => tokenSide(t, tokens)),
    priceRange: derivePriceRange(position, tokens, inverted),
    poolAddress: position.extension.pool.address,
  };
}
