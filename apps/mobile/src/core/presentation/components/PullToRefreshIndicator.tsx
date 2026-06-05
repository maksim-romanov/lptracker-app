import { useEffect } from "react";

import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type TProps = {
  scrollY: SharedValue<number>;
  refreshing: boolean;
  threshold: number;
};

const DOT_SIZE = 10;
const ORBIT_RADIUS = 13;
const CONTAINER_SIZE = (ORBIT_RADIUS + DOT_SIZE) * 2;
const SPIN_MS = 1200;
const PULSE_MS = 500;
const STAGGER_MS = 140;
const PULL_REVEAL_RATIO = 0.4;

const DOT_POSITIONS = [
  { key: "top", x: 0, y: -ORBIT_RADIUS },
  { key: "bottom-right", x: ORBIT_RADIUS * Math.cos(Math.PI / 6), y: ORBIT_RADIUS * Math.sin(Math.PI / 6) },
  { key: "bottom-left", x: -ORBIT_RADIUS * Math.cos(Math.PI / 6), y: ORBIT_RADIUS * Math.sin(Math.PI / 6) },
] as const;

export const PullToRefreshIndicator = ({ scrollY, refreshing, threshold }: TProps) => {
  const spin = useSharedValue(0);
  const refreshProgress = useSharedValue(0);
  const pulse0 = useSharedValue(1);
  const pulse1 = useSharedValue(1);
  const pulse2 = useSharedValue(1);

  useEffect(() => {
    refreshProgress.value = withTiming(refreshing ? 1 : 0, { duration: 220 });

    const pulses = [pulse0, pulse1, pulse2];

    if (refreshing) {
      spin.value = 0;
      spin.value = withRepeat(withTiming(360, { duration: SPIN_MS, easing: Easing.linear }), -1);

      pulses.forEach((p, i) => {
        p.value = withDelay(
          i * STAGGER_MS,
          withRepeat(
            withSequence(
              withTiming(1.25, { duration: PULSE_MS / 2, easing: Easing.inOut(Easing.quad) }),
              withTiming(0.7, { duration: PULSE_MS / 2, easing: Easing.inOut(Easing.quad) }),
            ),
            -1,
            true,
          ),
        );
      });
    } else {
      cancelAnimation(spin);
      spin.value = withTiming(0, { duration: 200 });
      for (const p of pulses) {
        cancelAnimation(p);
        p.value = withTiming(1, { duration: 200 });
      }
    }
  }, [refreshing, spin, refreshProgress, pulse0, pulse1, pulse2]);

  const containerStyle = useAnimatedStyle(() => {
    const pull = -scrollY.value;
    const pullScale = interpolate(pull, [0, threshold], [0.4, 1], Extrapolation.CLAMP);
    const pullOpacity = interpolate(pull, [0, threshold * PULL_REVEAL_RATIO], [0, 1], Extrapolation.CLAMP);

    const opacity = Math.max(pullOpacity, refreshProgress.value);
    const scale = Math.max(pullScale * (pullOpacity > 0 ? 1 : 0), refreshProgress.value);

    return {
      opacity,
      transform: [{ scale }, { rotate: `${spin.value}deg` }],
    };
  });

  const dotPulses = [pulse0, pulse1, pulse2];

  return (
    <Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
      {DOT_POSITIONS.map((pos, i) => (
        <Dot key={pos.key} x={pos.x} y={pos.y} pulse={dotPulses[i]} />
      ))}
    </Animated.View>
  );
};

type TDotProps = {
  x: number;
  y: number;
  pulse: SharedValue<number>;
};

const Dot = ({ x, y, pulse }: TDotProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x }, { translateY: y }, { scale: pulse.value }],
  }));
  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    height: CONTAINER_SIZE,
    zIndex: 5,
  },

  dot: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: theme.primary,
  },
}));
