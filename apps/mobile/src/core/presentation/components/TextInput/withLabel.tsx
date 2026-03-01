import React from "react";
import { type TextInput, View } from "react-native";

import { StyleSheet } from "react-native-unistyles";

import { Text } from "../Text";
import type { TProps as TextInputProps } from "./TextInput";

export const withLabel = <T extends TextInputProps>(Component: React.ComponentType<T>) => {
  return React.forwardRef<TextInput, T & { label?: string }>((props, ref) => {
    const { label, editable } = props;

    styles.useVariants({ editable });

    return (
      <View>
        <Component {...(props as T)} ref={ref} />

        {label && (
          <View style={styles.textContainer}>
            <Text variant="label" style={styles.text}>
              {label}
            </Text>
          </View>
        )}
      </View>
    );
  });
};

const styles = StyleSheet.create((theme) => ({
  textContainer: {
    position: "absolute",
    backgroundColor: theme.surface,
    borderRadius: 999,
    paddingHorizontal: theme.spacing.xs,

    top: -10,
    left: 10,
  },

  text: {
    variants: {
      editable: {
        false: { opacity: 0.5 },
      },
    },
  },

  error: {
    color: theme.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.md,
  },
}));
