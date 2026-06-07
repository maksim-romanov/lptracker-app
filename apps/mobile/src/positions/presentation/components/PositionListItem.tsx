import { Pressable } from "react-native";

import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import type { TGatewayPosition, TTokensMap } from "positions/domain/types";
import { positionRoutes } from "positions/presentation/lib/routes";

import { renderPositionCard } from "../render-position-card";

interface Props {
  readonly position: TGatewayPosition;
  readonly tokens: TTokensMap;
}

export const PositionListItem = observer(function PositionListItem({ position, tokens }: Props) {
  const router = useRouter();
  const handlePress = () => router.push(positionRoutes.detail(position.ref));

  return <Pressable onPress={handlePress}>{renderPositionCard(position, tokens)}</Pressable>;
});
