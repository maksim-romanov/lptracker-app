import React, { useRef } from "react";
import { Text, type TextInput, View } from "react-native";

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import type { TProps as TextInputProps } from "./TextInput";

const EMOJIS = ["✅", "👍", "👌", "🎉", "🔥", "🤟"];
const pickEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

const PostfixIcons = ({ isValid = false }: { isValid?: boolean }) => {
  const emojiRef = useRef(pickEmoji());
  const wasERC20 = useRef(false);

  if (isValid && !wasERC20.current) emojiRef.current = pickEmoji();
  wasERC20.current = isValid;

  const height = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(isValid ? 0 : height.value, { duration: 200 }) }],
  }));

  return (
    <View
      style={styles.iconsContainer}
      onLayout={(e) => {
        height.value = e.nativeEvent.layout.height;
      }}
    >
      <Animated.View style={containerStyle}>
        <View style={styles.iconContainer}>
          <Text>{emojiRef.current}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

export const withERC20 = <T extends TextInputProps>(Component: React.ComponentType<T>) => {
  return React.forwardRef<TextInput, T>((props, ref) => {
    return (
      <Component
        ref={ref}
        postfix={<PostfixIcons isValid={props.isValid} />}
        placeholder="0x..."
        autoCapitalize="none"
        autoCorrect={false}
        {...(props as T)}
      />
    );
  });
};

const styles = StyleSheet.create((theme) => ({
  iconsContainer: {
    flex: 1,
    overflow: "hidden",
  },

  iconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: theme.spacing.xxs,
  },
}));
