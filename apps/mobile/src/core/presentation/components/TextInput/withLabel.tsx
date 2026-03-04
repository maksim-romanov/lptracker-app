import React from "react";
import { type TextInput, View } from "react-native";

import Animated, { interpolate, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Text } from "../Text";
import type { TProps as TextInputProps } from "./TextInput";

const FLOATING_TOP = -12;
const FLOATING_LEFT = 10;
const TIMING = { duration: 200 };

export const withLabel = <T extends TextInputProps>(Component: React.ComponentType<T>) => {
  return React.forwardRef<TextInput, T & { label?: string }>((props, ref) => {
    const { label, editable, value, onFocus, onBlur } = props;

    styles.useVariants({ editable });

    const { theme } = useUnistyles();
    const { spacing, typography } = theme;

    const isFocused = useSharedValue(false);
    const labelWidth = useSharedValue(0);

    const hasValue = useSharedValue(!!value);
    hasValue.value = !!value;

    const progress = useDerivedValue(() => withTiming(isFocused.value || hasValue.value ? 1 : 0, TIMING));

    const offsetY = spacing.lg + typography.input.lineHeight / 2 - FLOATING_TOP - typography.label.lineHeight / 2;
    const scale = typography.input.fontSize / typography.label.fontSize;
    const offsetX = spacing.lg - FLOATING_LEFT;

    const labelStyle = useAnimatedStyle(() => {
      const amount = progress.value;
      const currentScale = interpolate(amount, [0, 1], [scale, 1]);
      const scaleCompensation = ((currentScale - 1) * labelWidth.value) / 2;

      return {
        opacity: interpolate(amount, [0, 1], [0.5, 1]),
        transform: [
          { translateY: interpolate(amount, [0, 1], [offsetY, 0]) },
          { translateX: interpolate(amount, [0, 1], [offsetX + scaleCompensation, 0]) },
          { scale: currentScale },
        ],
      };
    });

    const bgStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

    return (
      <View>
        <Component
          {...(props as T)}
          ref={ref}
          placeholder={undefined}
          onFocus={(e) => {
            isFocused.value = true;
            onFocus?.(e);
          }}
          onBlur={(e) => {
            isFocused.value = false;
            onBlur?.(e);
          }}
        />

        <Animated.View style={[styles.container, labelStyle]} pointerEvents="none">
          <Animated.View style={[styles.background, bgStyle]} />
          <Text
            variant="label"
            style={styles.text}
            onLayout={(e) => {
              labelWidth.value = e.nativeEvent.layout.width;
            }}
          >
            {label}
          </Text>
        </Animated.View>
      </View>
    );
  });
};

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    top: FLOATING_TOP,
    left: FLOATING_LEFT,
    paddingHorizontal: theme.spacing.xs,
    justifyContent: "center",
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.surface,
    borderRadius: 999,
  },

  text: {
    variants: {
      editable: {
        false: { opacity: 0.5 },
      },
    },
  },
}));
