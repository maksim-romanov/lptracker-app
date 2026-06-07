import { memo } from "react";
import { Pressable } from "react-native";

import { UniswapV3PositionCard } from "features/uniswap-v3";
import { isPositionExt, type TGatewayPosition, type TTokensMap } from "positions/domain/types";

import { UnknownPositionBody } from "./UnknownPositionBody";

interface Props {
  readonly position: TGatewayPosition;
  readonly tokens: TTokensMap;
  readonly onPress: (ref: string) => void;
}

export const PositionListItem = memo(function PositionListItem({ position, tokens, onPress }: Props) {
  const handlePress = () => onPress(position.ref);
  if (isPositionExt(position, "uniswap-v3")) {
    return (
      <Pressable onPress={handlePress}>
        <UniswapV3PositionCard position={position} tokens={tokens} />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress}>
      <UnknownPositionBody position={position} />
    </Pressable>
  );
});
