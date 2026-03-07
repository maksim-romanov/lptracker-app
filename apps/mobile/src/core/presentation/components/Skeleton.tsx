import { useEffect } from "react";

import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
};

export const Skeleton = ({ width, height, borderRadius = 6 }: Props) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.skeleton, animatedStyle, { width, height, borderRadius }]} />;
};

const styles = StyleSheet.create((theme) => ({
  skeleton: {
    backgroundColor: theme.outlineVariant,
  },
}));
