import { Pressable } from "react-native";

import { PROTOCOL_PLUGINS } from "app/protocol-plugins";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { lookupPlugin } from "positions/domain/plugin-registry";
import type { TGatewayPosition, TTokensMap } from "positions/domain/types";
import { positionRoutes } from "positions/presentation/lib/routes";

import { PositionShell } from "./PositionShell";
import { UnknownPositionBody } from "./UnknownPositionBody";

interface Props {
  readonly position: TGatewayPosition;
  readonly tokens: TTokensMap;
}

export const PositionListItem = observer(function PositionListItem({ position, tokens }: Props) {
  const router = useRouter();
  const plugin = lookupPlugin(position.extension.type, position.extension.version, PROTOCOL_PLUGINS);

  const handlePress = () => router.push(positionRoutes.detail(position.ref));

  if (!plugin) {
    return (
      <Pressable onPress={handlePress}>
        <UnknownPositionBody position={position} />
      </Pressable>
    );
  }

  const ListBody = plugin.components.ListBody;
  return (
    <Pressable onPress={handlePress}>
      <PositionShell position={position} plugin={plugin}>
        <ListBody position={position} tokens={tokens} />
      </PositionShell>
    </Pressable>
  );
});
