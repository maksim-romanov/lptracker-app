import React from "react";
import type { TextInput } from "react-native";

import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { TProps as TextInputProps } from "./TextInput";

export const withAnimatedBorder = <T extends TextInputProps>(Component: React.ComponentType<T>) => {
  return React.forwardRef<TextInput, T>((props, ref) => {
    const { isError, isValid, onFocus, onBlur } = props;

    const isFocus = useSharedValue(false);
    const isErrorSV = useSharedValue(!!isError);
    isErrorSV.value = !!isError;
    const isValidSV = useSharedValue(!!isValid);
    isValidSV.value = !!isValid;

    const timing = { duration: 150 };
    const focusProgress = useDerivedValue(() => withTiming(isFocus.value ? 1 : 0, timing));
    const errorProgress = useDerivedValue(() => withTiming(isErrorSV.value ? 1 : 0, timing));
    const validProgress = useDerivedValue(() => withTiming(isValidSV.value ? 1 : 0, timing));

    const { theme } = useUnistyles();

    const borderStyle = useAnimatedStyle(() => {
      const validColor = interpolateColor(validProgress.value, [0, 1], [theme.outline, theme.success]);
      const errorColor = interpolateColor(errorProgress.value, [0, 1], [validColor, theme.error]);
      const borderColor = interpolateColor(focusProgress.value, [0, 1], [errorColor, theme.primary]);
      const active = Math.max(focusProgress.value, errorProgress.value, validProgress.value);

      return {
        borderColor,
        shadowColor: borderColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: active,
        shadowRadius: active * 2,
        elevation: active > 0.5 ? 2 : 0,
      };
    });

    return (
      <Animated.View style={[styles.wrapper, borderStyle]}>
        <Component
          {...(props as T)}
          ref={ref}
          containerStyle={[styles.container, props.containerStyle]}
          onFocus={(event) => {
            console.log("onFocus");
            isFocus.value = true;
            onFocus?.(event);
          }}
          onBlur={(event) => {
            isFocus.value = false;
            onBlur?.(event);
          }}
        />
      </Animated.View>
    );
  });
};

const styles = StyleSheet.create((theme) => ({
  container: {
    borderWidth: 0,
    borderColor: "transparent",
  },

  wrapper: {
    borderWidth: 1,
    borderColor: theme.outline,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.surface,
  },
}));
