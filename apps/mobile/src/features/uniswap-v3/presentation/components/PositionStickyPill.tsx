import { View } from "react-native";

import { Box, Inline, Stack } from "@grapp/stacks";
import { NetworkBadge, Tag, Text, TokensImages } from "core/presentation/components";
import { BlurView } from "expo-blur";
import Animated, { Extrapolation, interpolate, type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import tinycolor from "tinycolor2";

import type { TUniswapV3RangeStatus, TUniswapV3VM } from "../../domain/uniswap-v3.vm";

interface IProps {
  readonly vm: TUniswapV3VM;
  readonly chainId: number;
  readonly scrollOffset: SharedValue<number>;
  readonly heroEndY: SharedValue<number>;
}

const PILL_HEIGHT = 84;
const REVEAL_DISTANCE = 80;

const STATUS_TONE: Record<TUniswapV3RangeStatus, "success" | "warning" | "neutral"> = {
  "in-range": "success",
  "out-of-range": "warning",
  closed: "neutral",
};

const STATUS_LABEL: Record<TUniswapV3RangeStatus, string> = {
  "in-range": "In range",
  "out-of-range": "Out of range",
  closed: "Closed",
};

export const PositionStickyPill = function PositionStickyPill({ vm, chainId, scrollOffset, heroEndY }: IProps) {
  const pairTokens = [
    { symbol: vm.pair.base.symbol, address: vm.pair.base.tokenRef.split(":")[1] },
    { symbol: vm.pair.quote.symbol, address: vm.pair.quote.tokenRef.split(":")[1] },
  ];

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
            <TokensImages tokens={pairTokens} chainId={chainId} size="sm" />
            <Box flex="fluid">
              <Text variant="body" weight="bold" numberOfLines={1} style={styles.pair}>
                {vm.pair.base.symbol}
                <Text variant="body" style={styles.pairSlash}>
                  {" / "}
                </Text>
                {vm.pair.quote.symbol}
              </Text>
            </Box>
            <Text variant="mono" weight="bold">
              {vm.priceRange.currentLabel}
            </Text>
          </Box>
          <Inline space={1} alignY="center">
            <NetworkBadge chainId={chainId} size="sm" />
            <Tag tone="brand">V3</Tag>
            <Tag tone="neutral">{vm.feeTierLabel}</Tag>
            <Tag tone={STATUS_TONE[vm.status]}>{STATUS_LABEL[vm.status]}</Tag>
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
