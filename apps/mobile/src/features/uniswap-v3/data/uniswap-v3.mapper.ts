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

function tokenSide(positionToken: TPositionByExt<"uniswap-v3">["tokens"][number], tokens: TTokensMap): TUniswapV3TokenSide {
  const meta = tokens[positionToken.tokenRef];
  return {
    tokenRef: positionToken.tokenRef,
    symbol: meta?.symbol ?? positionToken.tokenRef,
    formatted: positionToken.balance.formatted,
    iconUrl: meta?.iconUrl ?? "",
  };
}

function tickToPrice(tick: number, baseDecimals: number, quoteDecimals: number): number {
  return Math.exp(tick * Math.log(1.0001) + (baseDecimals - quoteDecimals) * Math.log(10));
}

export function formatPrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) return "—";
  if (price >= 1000) return numbro(price).format({ thousandSeparated: true, mantissa: 2 });
  if (price >= 1) return numbro(price).format({ thousandSeparated: true, mantissa: 4 });
  if (price >= 0.0001) return numbro(price).format({ mantissa: 6 });
  if (price >= 0.000001) return numbro(price).format({ mantissa: 8 });
  return price.toExponential(2);
}

function derivePair(position: TPositionByExt<"uniswap-v3">, tokens: TTokensMap): TUniswapV3Pair {
  const principals = position.tokens.filter((t) => t.role === "principal");
  const baseRef = principals[0]?.tokenRef ?? "";
  const quoteRef = principals[1]?.tokenRef ?? "";
  const baseMeta = tokens[baseRef];
  const quoteMeta = tokens[quoteRef];
  return {
    base: { tokenRef: baseRef, symbol: baseMeta?.symbol ?? baseRef, iconUrl: baseMeta?.iconUrl ?? "" },
    quote: { tokenRef: quoteRef, symbol: quoteMeta?.symbol ?? quoteRef, iconUrl: quoteMeta?.iconUrl ?? "" },
  };
}

function derivePriceRange(position: TPositionByExt<"uniswap-v3">, tokens: TTokensMap): TUniswapV3PriceRange {
  const principals = position.tokens.filter((t) => t.role === "principal");
  const baseRef = principals[0]?.tokenRef ?? "";
  const quoteRef = principals[1]?.tokenRef ?? "";

  const baseDecimals = tokens[baseRef]?.decimals ?? 18;
  const quoteDecimals = tokens[quoteRef]?.decimals ?? 18;

  const minPrice = tickToPrice(position.extension.tickLower, baseDecimals, quoteDecimals);
  const currentPrice = tickToPrice(position.extension.pool.currentTick, baseDecimals, quoteDecimals);
  const maxPrice = tickToPrice(position.extension.tickUpper, baseDecimals, quoteDecimals);

  return {
    minLabel: formatPrice(minPrice),
    currentLabel: formatPrice(currentPrice),
    maxLabel: formatPrice(maxPrice),
    quoteSymbol: tokens[quoteRef]?.symbol ?? quoteRef,
    baseSymbol: tokens[baseRef]?.symbol ?? baseRef,
  };
}

export function mapToVm(position: TPositionByExt<"uniswap-v3">, tokens: TTokensMap): TUniswapV3VM {
  return {
    nftTokenId: position.extension.nftTokenId,
    feeTierLabel: position.extension.feeTierLabel,
    status: deriveStatus(position.status.state),
    pair: derivePair(position, tokens),
    principal: position.tokens.filter((t) => t.role === "principal").map((t) => tokenSide(t, tokens)),
    fees: position.tokens.filter((t) => t.role === "fee").map((t) => tokenSide(t, tokens)),
    priceRange: derivePriceRange(position, tokens),
    poolAddress: position.extension.pool.address,
  };
}
