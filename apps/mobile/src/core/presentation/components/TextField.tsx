import { type Ref, useState } from "react";
import { TextInput, type TextInputProps, View } from "react-native";

import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Text } from "./Text";

type Props = Omit<TextInputProps, "style" | "placeholderTextColor"> & {
  label?: string;
  error?: string;
  helper?: string;
  ref?: Ref<TextInput>;
};

export const TextField = ({ label, error, helper, ref, onFocus, onBlur, multiline, ...rest }: Props) => {
  const { theme } = useUnistyles();
  const [focused, setFocused] = useState(false);

  styles.useVariants({
    state: error ? "error" : focused ? "focused" : "idle",
    multiline: !!multiline,
  });

  return (
    <View>
      {label ? (
        <Text variant="bodySmall" color="muted" style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View style={styles.container}>
        <TextInput
          ref={ref}
          {...rest}
          multiline={multiline}
          placeholderTextColor={theme.onSurfaceVariant}
          selectionColor={theme.primary}
          style={styles.input}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
      </View>

      {error ? (
        <Text variant="bodySmall" color="error" style={styles.helper}>
          {error}
        </Text>
      ) : helper ? (
        <Text variant="bodySmall" color="muted" style={styles.helper}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  label: {
    marginBottom: theme.spacing.xs,
  },

  container: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.outlineVariant,

    variants: {
      state: {
        idle: {},
        focused: { borderColor: theme.primary },
        error: { borderColor: theme.error },
      },
      multiline: {
        true: { minHeight: 88 },
        false: {},
      },
    },
  },

  input: {
    fontFamily: "Satoshi-Regular",
    fontSize: 15,
    lineHeight: 21,
    color: theme.onSurface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 48,

    variants: {
      state: {
        idle: {},
        focused: {},
        error: {},
      },
      multiline: {
        true: {
          textAlignVertical: "top",
          minHeight: 88,
        },
        false: {},
      },
    },
  },

  helper: {
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
}));
