import { Pressable } from "react-native";

import { container } from "core/di/container";
import { Icon } from "core/presentation/components";
import { observer } from "mobx-react-lite";
import { useFollow } from "positions/presentation/hooks/useFollow";
import { FollowingStore } from "positions/presentation/stores/following.store";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { withUnistyles } from "react-native-unistyles";

const ThemedIcon = withUnistyles(Icon);

type TProps = {
  positionRef: string;
};

export const FavoriteStar = observer(function FavoriteStar({ positionRef }: TProps) {
  const store = container.resolve(FollowingStore);
  const follow = useFollow(positionRef);
  const favorite = store.isFollowing(positionRef);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.85, { duration: 80, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 8, stiffness: 320, mass: 0.5 });
  };

  const handlePress = () => follow.mutate(!favorite);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={16}
      accessibilityRole="button"
      accessibilityState={{ selected: favorite }}
      accessibilityLabel={favorite ? "Unfavorite position" : "Favorite position"}
    >
      <Animated.View style={animatedStyle}>
        <ThemedIcon
          name={favorite ? "star" : "star-outline"}
          size="md"
          uniProps={(theme) => ({ color: favorite ? theme.warning : theme.onSurfaceVariant })}
        />
      </Animated.View>
    </Pressable>
  );
});
