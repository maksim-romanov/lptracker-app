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
// Weibull saturating function maps tick distance to half-bar fraction:
//   h(d) = MAX_HALF * (1 - exp(-(d/SCALE)^ALPHA))
// SCALE — characteristic tick distance (~2.7x price ratio at SCALE=10K).
// ALPHA<1 makes the curve sub-linear near zero → tight positions stay visible.
// MAX_HALF<0.5 guarantees the segment never touches the bar edge.
const SCALE_TICKS = 10_000;
const SHAPE_ALPHA = 0.5;
const MAX_HALF = 0.49;

function halfSide(distance: number, isInfinite: boolean): number {
  if (isInfinite) return MAX_HALF;
  if (distance <= 0) return 0;
  return MAX_HALF * (1 - Math.exp(-((distance / SCALE_TICKS) ** SHAPE_ALPHA)));
}

// Signed half-width: positive when the bound sits on its expected side of
// current (lower-bound left of current, upper-bound right). Negative when the
// position is out of range — the bound has crossed past current and the
// segment must shift to that side of the thumb.
function signedLeftHalf(currentTick: number, tickLower: number, infiniteLower: boolean): number {
  const d = currentTick - tickLower;
  return d >= 0 ? halfSide(d, infiniteLower) : -halfSide(-d, false);
}

function signedRightHalf(currentTick: number, tickUpper: number, infiniteUpper: boolean): number {
  const d = tickUpper - currentTick;
  return d >= 0 ? halfSide(d, infiniteUpper) : -halfSide(-d, false);
}

// Thumb is anchored at the bar center (current price). Signed half-widths
// encode the position relative to current — in-range, out-of-range either
// side, partial-infinite, and full-range all collapse to the same formula.
export const PriceRangeBar = ({ currentTick, tickLower, tickUpper, style }: TPriceRangeBarProps) => {
  const { liquidityLeftPct, liquidityWidthPct, thumbPct, inRange } = useMemo(() => {
    const infiniteUpper = tickUpper >= INFINITE_TICK_THRESHOLD;
    const infiniteLower = tickLower <= -INFINITE_TICK_THRESHOLD;

    const leftHalf = signedLeftHalf(currentTick, tickLower, infiniteLower);
    const rightHalf = signedRightHalf(currentTick, tickUpper, infiniteUpper);

    const leftPct = 0.5 - leftHalf;
    const rightPct = 0.5 + rightHalf;

    return {
      liquidityLeftPct: Math.min(leftPct, rightPct),
      liquidityWidthPct: Math.max(0, rightPct - leftPct),
      thumbPct: 0.5,
      inRange: leftHalf > 0 && rightHalf > 0,
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
