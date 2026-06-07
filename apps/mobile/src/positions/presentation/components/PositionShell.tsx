import type { ReactNode } from "react";

import { Box, Inline, Stack } from "@grapp/stacks";
import { Card, NetworkBadge, Tag, Text } from "core/presentation/components";
import { observer } from "mobx-react-lite";
import type { IErasedProtocolPlugin } from "positions/domain/plugin-registry";
import type { TGatewayPosition } from "positions/domain/types";

import { FavoriteStar } from "./FavoriteStar";

interface Props {
  readonly position: TGatewayPosition;
  readonly plugin: IErasedProtocolPlugin;
  readonly children: ReactNode;
}

export const PositionShell = observer(function PositionShell({ position, plugin, children }: Props) {
  return (
    <Card variant="outlined" padding="lg">
      <Stack space={3}>
        <Box direction="row" alignY="center" gap={2}>
          <Box flex="fluid">
            <Inline space={1} alignY="center">
              <NetworkBadge chainId={position.chainId} size="sm" />
              <Tag tone="brand">{plugin.meta.label}</Tag>
              <StatusTag state={position.status.state} />
            </Inline>
          </Box>
          <FavoriteStar positionRef={position.ref} />
        </Box>
        <Text variant="bodySmall" color="muted" numberOfLines={1}>
          {position.container.label}
        </Text>
        {children}
      </Stack>
    </Card>
  );
});

const StatusTag = function StatusTag({ state }: { state: string }) {
  const tone = state === "in-range" ? "success" : state === "closed" ? "neutral" : "warning";
  return <Tag tone={tone}>{state}</Tag>;
};
