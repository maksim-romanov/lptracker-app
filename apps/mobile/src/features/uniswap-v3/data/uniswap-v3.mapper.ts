import type { TPositionByExt, TTokensMap } from "positions/domain/types";

import type { TUniswapV3PriceRange, TUniswapV3RangeStatus, TUniswapV3TokenSide, TUniswapV3VM } from "../domain/uniswap-v3.vm";

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
  };
}

function derivePriceRange(position: TPositionByExt<"uniswap-v3">, tokens: TTokensMap): TUniswapV3PriceRange {
  const principals = position.tokens.filter((t) => t.role === "principal");
  const baseRef = principals[0]?.tokenRef ?? "";
  const quoteRef = principals[1]?.tokenRef ?? "";
  return {
    minLabel: String(position.extension.tickLower),
    currentLabel: String(position.extension.pool.currentTick),
    maxLabel: String(position.extension.tickUpper),
    quoteSymbol: tokens[quoteRef]?.symbol ?? quoteRef,
    baseSymbol: tokens[baseRef]?.symbol ?? baseRef,
  };
}

export function mapToVm(position: TPositionByExt<"uniswap-v3">, tokens: TTokensMap): TUniswapV3VM {
  return {
    nftTokenId: position.extension.nftTokenId,
    feeTierLabel: position.extension.feeTierLabel,
    status: deriveStatus(position.status.state),
    principal: position.tokens.filter((t) => t.role === "principal").map((t) => tokenSide(t, tokens)),
    fees: position.tokens.filter((t) => t.role === "fee").map((t) => tokenSide(t, tokens)),
    priceRange: derivePriceRange(position, tokens),
    poolAddress: position.extension.pool.address,
  };
}
