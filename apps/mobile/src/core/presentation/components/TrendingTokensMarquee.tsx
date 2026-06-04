import { useEffect, useState } from "react";
import { View } from "react-native";

import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Text } from "./Text";
import { TokenImage } from "./TokenImage";

export type TickerToken = {
  symbol: string;
  /** 24h percent change, e.g. +2.4 or -1.8. */
  change: number;
  address?: string;
  chainId?: number | string;
};

type Props = {
  tokens: TickerToken[];
  /** Duration in ms for one full pass of a single set of tokens. */
  durationPerSetMs?: number;
};

export const TrendingTokensMarquee = ({ tokens, durationPerSetMs = 22000 }: Props) => {
  const { theme } = useUnistyles();
  const [setWidth, setSetWidth] = useState(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (setWidth === 0) return;
    translateX.value = 0;
    translateX.value = withRepeat(withTiming(-setWidth, { duration: durationPerSetMs, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(translateX);
  }, [setWidth, durationPerSetMs, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (tokens.length === 0) return null;

  const renderChip = (token: TickerToken, key: string) => {
    const positive = token.change >= 0;
    const tone = positive ? theme.success : theme.error;
    return (
      <View key={key} style={styles.chip}>
        <TokenImage token={{ symbol: token.symbol, address: token.address }} chainId={token.chainId} size="sm" />
        <Text variant="label" weight="bold">
          {token.symbol}
        </Text>
        <Text variant="label" weight="medium" style={{ color: tone }}>
          {positive ? "+" : ""}
          {token.change.toFixed(1)}%
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.row, animatedStyle]}>
        <View style={styles.set} onLayout={(e) => setSetWidth(e.nativeEvent.layout.width)}>
          {tokens.map((token, idx) => renderChip(token, `a-${token.symbol}-${idx}`))}
        </View>
        <View style={styles.set}>{tokens.map((token, idx) => renderChip(token, `b-${token.symbol}-${idx}`))}</View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
  },

  // Each set is rendered twice (a/b) so when the first set slides past the
  // container's left edge, the second is already in view — gives a seamless
  // infinite loop without any easing glitch at the wrap point.
  set: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: theme.surfaceContainer,
    paddingLeft: 4,
    paddingRight: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
  },
}));
