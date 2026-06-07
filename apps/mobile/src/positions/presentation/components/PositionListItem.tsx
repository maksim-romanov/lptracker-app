import { memo } from "react";
import { Pressable } from "react-native";

import type { TGatewayPosition, TTokensMap } from "positions/domain/types";

import { renderPositionCard } from "../render-position-card";

interface Props {
  readonly position: TGatewayPosition;
  readonly tokens: TTokensMap;
  readonly onPress: (ref: string) => void;
}

export const PositionListItem = memo(function PositionListItem({ position, tokens, onPress }: Props) {
  return <Pressable onPress={() => onPress(position.ref)}>{renderPositionCard(position, tokens)}</Pressable>;
});
