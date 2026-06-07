import type { ReactNode } from "react";

import { Inline, Stack } from "@grapp/stacks";
import { NetworkBadge, Tag, Text } from "core/presentation/components";
import { observer } from "mobx-react-lite";
import type { IErasedProtocolPlugin } from "positions/domain/plugin-registry";
import type { TGatewayPosition, TTokensMap } from "positions/domain/types";

interface Props {
  readonly position: TGatewayPosition;
  readonly tokens: TTokensMap;
  readonly plugin: IErasedProtocolPlugin;
  readonly children: ReactNode;
}

export const PositionDetailShell = observer(function PositionDetailShell({ position, tokens, plugin, children }: Props) {
  const Strip = plugin.components.Strip;
  return (
    <Stack space={4}>
      {Strip ? <Strip position={position} tokens={tokens} /> : null}
      <Inline space={2} alignY="center">
        <NetworkBadge chainId={position.chainId} />
        <Tag tone="brand">{plugin.meta.label}</Tag>
      </Inline>
      <Text variant="label" color="muted" numberOfLines={1}>
        {position.container.label}
      </Text>
      {children}
    </Stack>
  );
});
