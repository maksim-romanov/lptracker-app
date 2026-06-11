import type React from "react";
import { ActivityIndicator, Pressable, type PressableProps, View, type ViewStyle } from "react-native";

import { StyleSheet, type UnistylesVariants, useUnistyles } from "react-native-unistyles";

import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

type Variants = UnistylesVariants<typeof styles>;

export type ButtonProps = Omit<PressableProps, "disabled" | "style" | "children"> &
  Variants & {
    title?: string;
    icon?: IconName;
    iconPosition?: "leading" | "trailing";
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    children?: React.ReactNode;
  };

export const Button = ({
  title,
  icon,
  iconPosition = "leading",
  variant = "primary",
  size = "md",
  loading,
  disabled,
  style,
  children,
  ...rest
}: ButtonProps) => {
  const { theme } = useUnistyles();
  styles.useVariants({ variant, size, disabled: !!disabled || !!loading });

  const labelColor =
    variant === "primary" ? theme.onPrimary : variant === "destructive" ? theme.error : variant === "ghost" ? theme.onSurface : theme.onSurface;

  return (
    <Pressable {...rest} disabled={disabled || loading} style={[styles.container, style]}>
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <View style={styles.inner}>
          {icon && iconPosition === "leading" && <Icon name={icon} size="sm" color={labelColor} />}
          {children ??
            (title && (
              <Text variant="label" weight="bold" style={{ color: labelColor, fontSize: size === "sm" ? 13 : 15 }}>
                {title}
              </Text>
            ))}
          {icon && iconPosition === "trailing" && <Icon name={icon} size="sm" color={labelColor} />}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
    flexDirection: "row",

    variants: {
      variant: {
        primary: {
          backgroundColor: theme.primary,
        },
        inverse: {
          backgroundColor: theme.inverseSurface,
        },
        outline: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.outline,
        },
        ghost: {
          backgroundColor: "transparent",
        },
        destructive: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.error,
        },
      },

      size: {
        sm: {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          minHeight: 32,
        },
        md: {
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
          minHeight: 40,
        },
        lg: {
          paddingHorizontal: theme.spacing["2xl"],
          paddingVertical: theme.spacing.lg,
          minHeight: 48,
        },
      },

      disabled: {
        true: { opacity: 0.5 },
      },
    },
  },

  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
}));
