import type React from "react";
import { View, type ViewStyle } from "react-native";

import { StyleSheet, type UnistylesVariants, useUnistyles } from "react-native-unistyles";

import { Text } from "./Text";

type Variants = UnistylesVariants<typeof styles>;

type Props = Variants & {
  children: React.ReactNode;
  /** Override tint (e.g., for network-specific tags). */
  color?: string;
  style?: ViewStyle;
};

export const Tag = ({ children, color, tone = "neutral", style }: Props) => {
  const { theme } = useUnistyles();
  styles.useVariants({ tone });

  const overrideStyle = color ? { backgroundColor: `${color}26`, borderColor: color } : null;

  const toneTextColor =
    tone === "success"
      ? theme.success
      : tone === "warning"
        ? theme.warning
        : tone === "error"
          ? theme.error
          : tone === "brand"
            ? theme.primary
            : theme.onSurface;

  return (
    <View style={[styles.container, overrideStyle, style]}>
      <Text variant="label" weight="bold" style={{ color: color ?? toneTextColor }}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    alignSelf: "flex-start",

    variants: {
      tone: {
        neutral: { backgroundColor: theme.surfaceContainer, borderColor: theme.outline },
        brand: { backgroundColor: `${theme.primary}1F`, borderColor: theme.primary },
        success: { backgroundColor: `${theme.success}1F`, borderColor: theme.success },
        warning: { backgroundColor: `${theme.warning}1F`, borderColor: theme.warning },
        error: { backgroundColor: theme.errorContainer, borderColor: theme.error },
      },
    },
  },
}));
