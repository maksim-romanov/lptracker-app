import { View } from "react-native";

import { Box, Inline, Stack } from "@grapp/stacks";
import { NetworkBadge, Tag, Text, TokensImages } from "core/presentation/components";
import { formatUsd } from "core/presentation/utils/format";
import { BlurView } from "expo-blur";
import type { PositionDetailVM } from "positions/data/fixtures/positions.fixtures";
import Animated, { Extrapolation, interpolate, type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import tinycolor from "tinycolor2";

type TProps = {
  position: PositionDetailVM;
  scrollOffset: SharedValue<number>;
  heroEndY: SharedValue<number>;
};

const PILL_HEIGHT = 84;
const REVEAL_DISTANCE = 80;

export const PositionStickyPill = ({ position, scrollOffset, heroEndY }: TProps) => {
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
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
      <View style={styles.tint} />
      <View style={styles.content}>
        <Stack space={2}>
          <Box direction="row" alignY="center" gap={2}>
            <TokensImages tokens={[position.pair.token0, position.pair.token1]} chainId={position.chainId} size="sm" />
            <Box flex="fluid">
              <Text variant="body" weight="bold" numberOfLines={1} style={styles.pair}>
                {position.pair.token0.symbol}
                <Text variant="body" style={styles.pairSlash}>
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
      </View>
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
    overflow: "hidden",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tinycolor(theme.outline).setAlpha(0.4).toRgbString(),
    zIndex: 10,
  },

  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tinycolor(theme.surface).setAlpha(0.55).toRgbString(),
  },

  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    justifyContent: "center",
  },

  pair: {
    flexShrink: 1,
    letterSpacing: -0.2,
  },

  pairSlash: {
    color: theme.onSurfaceVariant,
    fontFamily: "Satoshi-Medium",
  },
}));
