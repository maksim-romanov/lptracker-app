import { useMemo } from "react";
import { View, type ViewProps } from "react-native";

import { StyleSheet } from "react-native-unistyles";
import tinycolor from "tinycolor2";

export type Props = {
  /** Current pool tick */
  currentTick: number;
  /** Position lower bound */
  tickLower: number;
  /** Position upper bound */
  tickUpper: number;
} & Pick<ViewProps, "style">;

/**
 * Concentrated-liquidity range visualization.
 *
 * The grey track is the *context window* — wider than the position itself, so
 * out-of-range drift is visible as space between the colored liquidity segment
 * and the thumb. The colored segment is the position's [tickLower, tickUpper];
 * the thumb is the current pool tick. When the price drifts beyond the range,
 * the context window expands on that side proportional to the drift, so the
 * eye reads "how far out of range" at a glance.
 */
export const PriceRangeBar = ({ currentTick, tickLower, tickUpper, style }: Props) => {
  const { liquidityLeftPct, liquidityWidthPct, thumbPct, inRange } = useMemo(() => {
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

    return {
      liquidityLeftPct: (tickLower - viewLower) / viewSpan,
      liquidityWidthPct: span / viewSpan,
      thumbPct: Math.max(0.01, Math.min(0.99, (currentTick - viewLower) / viewSpan)),
      inRange: currentTick >= tickLower && currentTick <= tickUpper,
    };
  }, [currentTick, tickLower, tickUpper]);

  styles.useVariants({ inRange });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.track}>
        <View style={[styles.liquidity, styles.liquidityPosition(liquidityLeftPct, liquidityWidthPct)]} />
        <View style={[styles.thumb, styles.thumbPosition(thumbPct)]} />
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
    backgroundColor: tinycolor(theme.onSurface).setAlpha(0.08).toRgbString(),
  },

  liquidity: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: theme.radius.full,

    variants: {
      inRange: {
        true: { backgroundColor: tinycolor(theme.success).setAlpha(0.45).toRgbString() },
        false: { backgroundColor: tinycolor(theme.warning).setAlpha(0.45).toRgbString() },
      },
    },
  },

  liquidityPosition: (leftPct: number, widthPct: number) => ({
    left: `${leftPct * 100}%`,
    width: `${widthPct * 100}%`,
  }),

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
    boxShadow: "0 1px 3px rgba(0,0,0,0.18)",

    variants: {
      inRange: {
        true: { backgroundColor: theme.success },
        false: { backgroundColor: theme.warning },
      },
    },
  },

  thumbPosition: (pct: number) => ({
    left: `${pct * 100}%`,
  }),
}));
