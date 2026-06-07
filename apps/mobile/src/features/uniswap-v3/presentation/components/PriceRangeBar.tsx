import { useMemo } from "react";
import { View, type ViewProps } from "react-native";

import { StyleSheet } from "react-native-unistyles";
import tinycolor from "tinycolor2";

export type TPriceRangeBarProps = {
  currentTick: number;
  tickLower: number;
  tickUpper: number;
} & Pick<ViewProps, "style">;

const INFINITE_TICK_THRESHOLD = 800_000;

// Concentrated-liquidity range visualization. The track is a *context window* —
// wider than the position itself, so out-of-range drift reads as space between
// the liquidity segment and the thumb. MIN_LIQ_PCT keeps the liquidity bar from
// shrinking below a readable fraction of the width.
export const PriceRangeBar = ({ currentTick, tickLower, tickUpper, style }: TPriceRangeBarProps) => {
  const { liquidityLeftPct, liquidityWidthPct, thumbPct, inRange } = useMemo(() => {
    const infiniteUpperBound = tickUpper >= INFINITE_TICK_THRESHOLD;
    const infiniteLowerBound = tickLower <= -INFINITE_TICK_THRESHOLD;

    // Full-range positions: bar IS the position, no meaningful "outside". Fill 100%.
    if (infiniteUpperBound && infiniteLowerBound) {
      const VISIBLE_HALF = 200_000;
      const symbolicThumb = Math.max(0.02, Math.min(0.98, (currentTick + VISIBLE_HALF) / (VISIBLE_HALF * 2)));
      return {
        liquidityLeftPct: 0,
        liquidityWidthPct: 1,
        thumbPct: symbolicThumb,
        inRange: true,
      };
    }

    const span = tickUpper - tickLower;
    if (span <= 0) {
      return { liquidityLeftPct: 0, liquidityWidthPct: 0, thumbPct: 0.5, inRange: false };
    }

    const basePad = span * 0.3;
    const MIN_LIQ_PCT = 0.32;
    const maxViewSpan = span / MIN_LIQ_PCT;

    let padLow = basePad;
    let padHigh = basePad;

    if (currentTick < tickLower) {
      padLow = Math.max(basePad, (tickLower - currentTick) * 1.3);
    } else if (currentTick > tickUpper) {
      padHigh = Math.max(basePad, (currentTick - tickUpper) * 1.3);
    }

    if (span + padLow + padHigh > maxViewSpan) {
      if (currentTick < tickLower) {
        padHigh = basePad;
        padLow = maxViewSpan - span - basePad;
      } else {
        padLow = basePad;
        padHigh = maxViewSpan - span - basePad;
      }
    }

    const viewLower = tickLower - padLow;
    const viewSpan = span + padLow + padHigh;
    const leftPct = (tickLower - viewLower) / viewSpan;
    const widthPct = span / viewSpan;

    return {
      // When only one bound is "infinite", visually extend liquidity bar to that edge.
      liquidityLeftPct: infiniteLowerBound ? 0 : leftPct,
      liquidityWidthPct: infiniteLowerBound ? leftPct + widthPct : infiniteUpperBound ? 1 - leftPct : widthPct,
      thumbPct: Math.max(0.01, Math.min(0.99, (currentTick - viewLower) / viewSpan)),
      inRange: currentTick >= tickLower && currentTick <= tickUpper,
    };
  }, [currentTick, tickLower, tickUpper]);

  styles.useVariants({ inRange });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.track}>
        <View style={[styles.liquidity, { left: `${liquidityLeftPct * 100}%`, width: `${liquidityWidthPct * 100}%` }]} />
        <View style={[styles.thumb, { left: `${thumbPct * 100}%` }]} />
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
        // Nearly opaque — kills the mustard-blend artifact of low-alpha-on-dark.
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
