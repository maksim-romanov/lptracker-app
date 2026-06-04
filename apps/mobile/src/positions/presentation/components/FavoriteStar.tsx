import { Pressable } from "react-native";

import { Icon } from "core/presentation/components";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { withUnistyles } from "react-native-unistyles";

const ThemedIcon = withUnistyles(Icon);

type TProps = {
  favorite: boolean;
  onToggle: () => void;
};

export const FavoriteStar = ({ favorite, onToggle }: TProps) => {
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

  return (
    <Pressable
      onPress={onToggle}
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
};
