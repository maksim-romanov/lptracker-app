import { TextInput as RNTextInput, type TextInputProps as RNTextInputProps, View } from "react-native";

import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Text } from "./Text";

type TProps = {
  label?: string;
  error?: string;
} & RNTextInputProps;

export function TextInput({ label, error, style, ...props }: TProps) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text variant="label" color="onSurfaceVariant">
          {label}
        </Text>
      )}
      <RNTextInput style={[styles.input, error && styles.inputError, style]} placeholderTextColor={theme.onSurfaceVariant} {...props} />
      {error && (
        <Text variant="bodySmall" color="error">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    gap: theme.spacing.xs,
  },

  input: {
    fontFamily: "Satoshi-Regular",
    fontSize: 16,
    color: theme.onSurface,
    backgroundColor: theme.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.outline,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },

  inputError: {
    borderColor: theme.error,
  },
}));
