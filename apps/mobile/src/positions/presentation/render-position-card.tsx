import type { ReactNode } from "react";

import { UniswapV3PositionCard } from "features/uniswap-v3";
import type { TGatewayPosition, TPositionByExt, TTokensMap } from "positions/domain/types";

import { UnknownPositionBody } from "./components/UnknownPositionBody";

export function renderPositionCard(position: TGatewayPosition, tokens: TTokensMap): ReactNode {
  switch (position.extension.type) {
    case "uniswap-v3":
      return <UniswapV3PositionCard position={position as TPositionByExt<"uniswap-v3">} tokens={tokens} />;
    default:
      return <UnknownPositionBody position={position} />;
  }
}
