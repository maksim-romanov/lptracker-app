import { UniswapV3PositionDetail } from "features/uniswap-v3";
import { isPositionExt, type TGatewayPosition, type TTokensMap } from "positions/domain/types";

import { UnknownPositionBody } from "./UnknownPositionBody";

interface Props {
  readonly position: TGatewayPosition;
  readonly tokens: TTokensMap;
}

export const PositionDetailBody = function PositionDetailBody({ position, tokens }: Props) {
  if (isPositionExt(position, "uniswap-v3")) {
    return <UniswapV3PositionDetail position={position} tokens={tokens} />;
  }
  return <UnknownPositionBody position={position} />;
};
