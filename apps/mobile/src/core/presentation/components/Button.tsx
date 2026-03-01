import { ActivityIndicator, Pressable, type PressableProps } from "react-native";

import { StyleSheet, type UnistylesVariants, useUnistyles } from "react-native-unistyles";

import { Text } from "./Text";

type ComponentVariants = UnistylesVariants<typeof styles>;

type TProps = {
  title: string;
  loading?: boolean;
  disabled?: boolean;
} & ComponentVariants &
  Omit<PressableProps, "children" | "disabled">;

export function Button({ title, loading, disabled, variant = "filled", ...props }: TProps) {
  styles.useVariants({ variant });
  const { theme } = useUnistyles();

  const isDisabled = disabled || loading;

  const textColor = variant === "filled" ? theme.onPrimary : variant === "destructive" ? theme.error : theme.primary;

  return (
    <Pressable style={[styles.container, isDisabled && styles.disabled]} disabled={isDisabled} {...props}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text variant="label" bold style={{ color: textColor }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,

    variants: {
      variant: {
        filled: {
          backgroundColor: theme.primary,
        },
        outline: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.outline,
        },
        destructive: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.error,
        },
      },
    },
  },

  disabled: {
    opacity: 0.5,
  },
}));
