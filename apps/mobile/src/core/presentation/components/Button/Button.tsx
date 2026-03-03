import { Pressable, type PressableProps, Text, type ViewStyle } from "react-native";

import { pipe } from "fp-ts/function";
import { StyleSheet } from "react-native-unistyles";

import { withLoading } from "./withLoading";

export type TProps = {
  title: string;
  variant?: "filled" | "outline" | "destructive";
  size?: "md" | "sm";
  disabled?: boolean;
} & Omit<PressableProps, "disabled">;

export const Button = pipe((props: TProps) => {
  const { title, variant = "filled", size = "md", disabled, children, ...rest } = props;

  styles.useVariants({ variant, size, disabled: !!disabled });

  return (
    <Pressable {...rest} style={[styles.container, props.style as ViewStyle]} disabled={disabled}>
      {children ?? <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}, withLoading);

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,

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

      size: {
        md: {
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
        },
        sm: {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
        },
      },

      disabled: {
        true: {
          opacity: 0.5,
        },
      },
    },
  },

  text: {
    fontFamily: theme.typography.button.fontFamily,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    lineHeight: theme.typography.button.lineHeight,
    letterSpacing: theme.typography.button.letterSpacing,

    variants: {
      variant: {
        filled: { color: theme.onPrimary },
        outline: { color: theme.primary },
        destructive: { color: theme.error },
      },
    },
  },
}));
