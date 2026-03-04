import React from "react";
import { type TextInput, View } from "react-native";

import type { AnyFieldApi } from "@tanstack/react-form";
import Animated, { FadeIn } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "../Text";
import type { TProps as TextInputProps } from "./TextInput";

type TProps<T extends TextInputProps> = { field: AnyFieldApi } & Omit<T, "value" | "onChangeText" | "onBlur">;

export const withAdapter = <T extends TextInputProps>(Component: React.ComponentType<T>) => {
  return React.forwardRef<TextInput, TProps<T>>((props, ref) => {
    const { field, ...rest } = props as TProps<T>;

    const error = field.state.meta.errors[0];

    return (
      <View onLayout={() => {}} style={styles.container}>
        <Component
          ref={ref}
          value={field.state.value}
          onChangeText={field.handleChange}
          onBlur={field.handleBlur}
          isError={field.state.meta.isDirty && !!error}
          isValid={field.state.meta.isDirty && field.state.meta.isValid}
          {...(rest as unknown as T)}
        />

        {error && (
          <Animated.View entering={FadeIn} style={styles.errorContainer}>
            <Text variant="label" color="error">
              {error}
            </Text>
          </Animated.View>
        )}
      </View>
    );
  });
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.sm,
  },

  errorContainer: {
    paddingHorizontal: theme.spacing.sm,
  },
}));
