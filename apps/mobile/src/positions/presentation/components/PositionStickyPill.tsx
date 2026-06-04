import { Box, Inline, Stack } from "@grapp/stacks";
import { NetworkBadge, Tag, Text, TokensImages } from "core/presentation/components";
import { formatUsd } from "core/presentation/utils/format";
import type { PositionDetailVM } from "positions/presentation/mocks/positions.mock";
import Animated, { Extrapolation, interpolate, type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  position: PositionDetailVM;
  scrollOffset: SharedValue<number>;
  heroEndY: SharedValue<number>;
};

const PILL_HEIGHT = 88;
const REVEAL_DISTANCE = 80;

export const PositionStickyPill = ({ position, scrollOffset, heroEndY }: Props) => {
  const inRange = position.currentTick >= position.tickLower && position.currentTick <= position.tickUpper;

  const animatedStyle = useAnimatedStyle(() => {
    if (!heroEndY.value) return { transform: [{ translateY: -PILL_HEIGHT }] };
    const start = heroEndY.value - REVEAL_DISTANCE;
    const end = heroEndY.value;
    const ty = interpolate(scrollOffset.value, [start, end], [-PILL_HEIGHT, 0], Extrapolation.CLAMP);
    return { transform: [{ translateY: ty }] };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="box-none">
      <Stack space={2}>
        <Box direction="row" alignY="center" gap={3}>
          <TokensImages tokens={[position.pair.token0, position.pair.token1]} chainId={position.chainId} size="sm" />
          <Box flex="fluid">
            <Text variant="headline" weight="bold" numberOfLines={1} style={styles.pair}>
              {position.pair.token0.symbol}
              <Text variant="headline" style={styles.pairSlash}>
                {" / "}
              </Text>
              {position.pair.token1.symbol}
            </Text>
          </Box>
          <Text variant="mono" weight="bold">
            {formatUsd(position.positionValueUsd)}
          </Text>
        </Box>
        <Inline space={1} alignY="center">
          <NetworkBadge chainId={position.chainId} size="sm" />
          <Tag tone="brand">V3</Tag>
          <Tag tone="neutral">{(position.feeBps / 100).toFixed(2)}%</Tag>
          <Tag tone={inRange ? "success" : "warning"}>{inRange ? "In range" : "Out of range"}</Tag>
        </Inline>
      </Stack>
    </Animated.View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: PILL_HEIGHT,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.outline,
    zIndex: 10,
  },

  pair: {
    flexShrink: 1,
    letterSpacing: -0.3,
  },

  pairSlash: {
    color: theme.onSurfaceVariant,
    fontFamily: "Satoshi-Medium",
  },
}));
