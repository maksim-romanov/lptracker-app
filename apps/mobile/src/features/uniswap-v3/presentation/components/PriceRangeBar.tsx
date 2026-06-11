import { useEffect } from "react";
import { View, type ViewProps } from "react-native";

import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import tinycolor from "tinycolor2";

export type TPriceRangeBarProps = {
  currentTick: number;
  tickLower: number;
  tickUpper: number;
  inverted?: boolean;
} & Pick<ViewProps, "style">;

// Band-width clamps. Floor keeps the band visible against the thumb on
// micro-ranges; ceiling leaves bar margin for out-of-range overshoot.
const MIN_BAND_WIDTH = 0.2;
const MAX_BAND_WIDTH = 0.7;

// Sigmoid in `log10(tickWidth)` — center anchored at log10(1000)
// (≈ ±5% price band, a typical concentrated LP range). Wider position →
// wider band, monotonic, no hard plateau.
const BAND_LOG_CENTER = 3.0;
const BAND_LOG_SPREAD = 1.0;

// Overshoot compression. As `|current - bound| / rangeWidth` grows the
// thumb travels through the side margin, asymptotically against the edge.
const OVERSHOOT_SCALE = 1.5;

function bandWidthFor(tickWidth: number): number {
  const logTicks = Math.log10(Math.max(1, tickWidth));
  const normalized = (logTicks - BAND_LOG_CENTER) / BAND_LOG_SPREAD;
  const sigmoid = 1 / (1 + Math.exp(-normalized));
  return MIN_BAND_WIDTH + sigmoid * (MAX_BAND_WIDTH - MIN_BAND_WIDTH);
}

type TLayout = {
  liquidityLeftPct: number;
  liquidityWidthPct: number;
  thumbPct: number;
  inRange: boolean;
};

function computeLayout(currentTick: number, tickLower: number, tickUpper: number, inverted: boolean): TLayout {
  // Inversion = reciprocal price = negated tick; lower↔upper swap.
  const cur = inverted ? -currentTick : currentTick;
  const lower = inverted ? -tickUpper : tickLower;
  const upper = inverted ? -tickLower : tickUpper;

  const rangeWidth = Math.max(1, upper - lower);
  const bandWidth = bandWidthFor(rangeWidth);
  const bandLeftPct = (1 - bandWidth) / 2;
  const bandRightPct = bandLeftPct + bandWidth;

  const currentPos = (cur - lower) / rangeWidth;
  const inRange = currentPos >= 0 && currentPos <= 1;

  let thumbPct: number;
  if (inRange) {
    thumbPct = bandLeftPct + currentPos * bandWidth;
  } else if (currentPos < 0) {
    const overshoot = -currentPos;
    const traveled = bandLeftPct * (1 - Math.exp(-overshoot / OVERSHOOT_SCALE));
    thumbPct = bandLeftPct - traveled;
  } else {
    const overshoot = currentPos - 1;
    const traveled = (1 - bandRightPct) * (1 - Math.exp(-overshoot / OVERSHOOT_SCALE));
    thumbPct = bandRightPct + traveled;
  }

  return {
    liquidityLeftPct: bandLeftPct,
    liquidityWidthPct: bandWidth,
    thumbPct,
    inRange,
  };
}

const TIMING = { duration: 320, easing: Easing.inOut(Easing.cubic) };

export const PriceRangeBar = ({ currentTick, tickLower, tickUpper, inverted = false, style }: TPriceRangeBarProps) => {
  const layout = computeLayout(currentTick, tickLower, tickUpper, inverted);

  const leftSV = useSharedValue(layout.liquidityLeftPct);
  const widthSV = useSharedValue(layout.liquidityWidthPct);
  const thumbSV = useSharedValue(layout.thumbPct);

  useEffect(() => {
    leftSV.value = withTiming(layout.liquidityLeftPct, TIMING);
    widthSV.value = withTiming(layout.liquidityWidthPct, TIMING);
    thumbSV.value = withTiming(layout.thumbPct, TIMING);
  }, [layout.liquidityLeftPct, layout.liquidityWidthPct, layout.thumbPct, leftSV, widthSV, thumbSV]);

  const animatedLiquidityStyle = useAnimatedStyle(() => ({
    left: `${leftSV.value * 100}%`,
    width: `${widthSV.value * 100}%`,
  }));

  const animatedThumbStyle = useAnimatedStyle(() => ({
    left: `${thumbSV.value * 100}%`,
  }));

  styles.useVariants({ inRange: layout.inRange });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.track}>
        <Animated.View style={[styles.liquidity, animatedLiquidityStyle]} />
        <Animated.View style={[styles.thumb, animatedThumbStyle]} />
      </View>
    </View>
  );
};

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 14;

const styles = StyleSheet.create((theme) => ({
  container: {
    justifyContent: "center",
    paddingVertical: THUMB_SIZE / 2,
  },

  track: {
    width: "100%",
    height: TRACK_HEIGHT,
    borderRadius: theme.radius.full,
    backgroundColor: tinycolor(theme.onSurface).setAlpha(0.05).toRgbString(),
  },

  liquidity: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: theme.radius.full,

    variants: {
      inRange: {
        true: { backgroundColor: tinycolor(theme.success).setAlpha(0.9).toRgbString() },
        false: { backgroundColor: tinycolor(theme.warning).setAlpha(0.9).toRgbString() },
      },
    },
  },

  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    top: "50%",
    marginLeft: -THUMB_SIZE / 2,
    marginTop: -THUMB_SIZE / 2,
    borderWidth: 2,
    borderColor: theme.surface,
    shadowOpacity: 0.85,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,

    variants: {
      inRange: {
        true: { backgroundColor: theme.success, shadowColor: theme.success },
        false: { backgroundColor: theme.warning, shadowColor: theme.warning },
      },
    },
  },
}));
