import type React from "react";
import { useEffect } from "react";
import { View } from "react-native";

import { PullToRefreshIndicator } from "core/presentation/components/PullToRefreshIndicator";
import Animated, {
  type AnimatedRef,
  runOnJS,
  type SharedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

const DEFAULT_THRESHOLD = 80;
const REFRESH_GAP = 60;

type TAnimatedScrollViewProps = React.ComponentProps<typeof Animated.ScrollView>;

type TProps = Omit<TAnimatedScrollViewProps, "refreshControl" | "ref" | "onScroll" | "children"> & {
  refreshing: boolean;
  onRefresh: () => void;
  scrollRef?: AnimatedRef<Animated.ScrollView>;
  scrollOffset?: SharedValue<number>;
  threshold?: number;
  children?: React.ReactNode;
};

export const PullToRefreshScrollView = ({
  refreshing,
  onRefresh,
  scrollRef: externalRef,
  scrollOffset: externalScrollOffset,
  threshold = DEFAULT_THRESHOLD,
  children,
  ...rest
}: TProps) => {
  const internalRef = useAnimatedRef<Animated.ScrollView>();
  const ref = externalRef ?? internalRef;

  const internalScrollOffset = useSharedValue(0);
  const scrollOffset = externalScrollOffset ?? internalScrollOffset;
  const triggered = useSharedValue(false);
  const gap = useSharedValue(0);

  useEffect(() => {
    gap.value = withTiming(refreshing ? REFRESH_GAP : 0, { duration: 240 });
  }, [refreshing, gap]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
    onBeginDrag: () => {
      triggered.value = false;
    },
    onEndDrag: (event) => {
      if (event.contentOffset.y < -threshold && !triggered.value) {
        triggered.value = true;
        runOnJS(onRefresh)();
      }
    },
  });

  const spacerStyle = useAnimatedStyle(() => ({
    height: gap.value,
  }));

  return (
    <View style={styles.root}>
      <PullToRefreshIndicator scrollY={scrollOffset} refreshing={refreshing} threshold={threshold} />
      <Animated.ScrollView {...rest} ref={ref} onScroll={scrollHandler} scrollEventThrottle={16}>
        <Animated.View style={spacerStyle} />
        {children}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  root: {
    flex: 1,
  },
}));
