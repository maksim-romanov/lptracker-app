import { Pressable, View } from "react-native";

import { Box, Inline, Stack } from "@grapp/stacks";
import { Card, Icon, NetworkBadge, PriceRangeBar, Tag, Text, TokensImages } from "core/presentation/components";
import { formatUsd } from "core/presentation/utils/format";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type PositionVM = {
  id: string;
  chainId: number;
  pair: { token0: { symbol: string; address?: string }; token1: { symbol: string; address?: string } };
  feeBps: number;
  /** Tick math drives the range bar. */
  currentTick: number;
  tickLower: number;
  tickUpper: number;
  feesEarnedUsd: number | null;
  positionValueUsd: number;
};

type Props = {
  position: PositionVM;
  favorite: boolean;
  onToggleFavorite: () => void;
  onPress?: () => void;
};

export const PositionCard = ({ position, favorite, onToggleFavorite, onPress }: Props) => {
  const { theme } = useUnistyles();
  const inRange = position.currentTick >= position.tickLower && position.currentTick <= position.tickUpper;

  return (
    <Card variant="outlined" padding="lg" onPress={onPress}>
      <Stack space={4}>
        {/* Top row: overlapped token logos + pair + favorite */}
        <Box direction="row" alignY="center" gap={3}>
          <TokensImages tokens={[position.pair.token0, position.pair.token1]} chainId={position.chainId} size="md" />

          <Box flex="fluid">
            <Text variant="title" weight="bold" numberOfLines={1} style={styles.pair}>
              {position.pair.token0.symbol}
              <Text variant="title" style={styles.pairSlash}>
                {" / "}
              </Text>
              {position.pair.token1.symbol}
            </Text>
          </Box>

          <Pressable onPress={onToggleFavorite} hitSlop={8}>
            <Icon name={favorite ? "star" : "star-outline"} size="md" color={favorite ? theme.warning : theme.onSurfaceVariant} />
          </Pressable>
        </Box>

        {/* Tags row */}
        <Inline space={2} alignY="center">
          <NetworkBadge chainId={position.chainId} size="sm" />
          <Tag tone="brand">V3</Tag>
          <Tag tone="neutral">{(position.feeBps / 100).toFixed(2)}%</Tag>
          <Tag tone={inRange ? "success" : "warning"}>{inRange ? "In range" : "Out of range"}</Tag>
        </Inline>

        {/* Visual range */}
        <PriceRangeBar currentTick={position.currentTick} tickLower={position.tickLower} tickUpper={position.tickUpper} />

        {/* Bottom row: two values */}
        <Box direction="row" alignY="top">
          <Box flex="fluid">
            <Text variant="label" color="muted" uppercase>
              Fees earned
            </Text>
            <Text variant="headline" weight="bold">
              {formatUsd(position.feesEarnedUsd)}
            </Text>
          </Box>
          <Box flex="fluid" alignX="right">
            <View style={styles.valueRight}>
              <Text variant="label" color="muted" uppercase>
                Position
              </Text>
              <Text variant="headline" weight="bold">
                {formatUsd(position.positionValueUsd)}
              </Text>
            </View>
          </Box>
        </Box>
      </Stack>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  pair: {
    flexShrink: 1,
    letterSpacing: -0.4,
  },

  pairSlash: {
    color: theme.onSurfaceVariant,
    fontFamily: "Satoshi-Medium",
  },

  valueRight: {
    alignItems: "flex-end",
  },
}));
