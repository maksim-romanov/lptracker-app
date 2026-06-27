import { formatPrice, formatTokenAmount } from "@depthly/protocol-math/format";
import { deriveStatus, priceRangeFromTicks } from "@depthly/protocol-math/uniswap-v3";
import type { TPositionByExt, TTokensMap } from "positions/domain/types";

import type { TUniswapV3Pair, TUniswapV3PriceRange, TUniswapV3TokenSide, TUniswapV3VM } from "../domain/uniswap-v3.vm";

function tokenSide(positionToken: TPositionByExt<"uniswap-v3">["tokens"][number], tokens: TTokensMap): TUniswapV3TokenSide {
  const meta = tokens[positionToken.tokenRef];
  return {
    tokenRef: positionToken.tokenRef,
    symbol: meta?.symbol ?? positionToken.tokenRef,
    formatted: formatTokenAmount(positionToken.balance.formatted, meta?.displayDecimals),
    iconUrl: meta?.iconUrl ?? "",
  };
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

  const { min, current, max } = priceRangeFromTicks({
    tickLower: position.extension.tickLower,
    tickUpper: position.extension.tickUpper,
    currentTick: position.extension.pool.currentTick,
    baseDecimals,
    quoteDecimals,
    inverted,
  });

  const displayQuoteRef = inverted ? baseRef : quoteRef;
  const displayBaseRef = inverted ? quoteRef : baseRef;

  return {
    minLabel: formatPrice(min),
    currentLabel: formatPrice(current),
    maxLabel: formatPrice(max),
    quoteSymbol: tokens[displayQuoteRef]?.symbol ?? displayQuoteRef,
    baseSymbol: tokens[displayBaseRef]?.symbol ?? displayBaseRef,
  };
}

export function mapToVm(position: TPositionByExt<"uniswap-v3">, tokens: TTokensMap, inverted = false): TUniswapV3VM {
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
