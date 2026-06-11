import { View, type ViewStyle } from "react-native";

import { StyleSheet, type UnistylesVariants } from "react-native-unistyles";

import { Text } from "./Text";

type Variants = UnistylesVariants<typeof styles>;

type Props = Variants & {
  label?: string;
  tint?: string;
  style?: ViewStyle;
};

const initials = (label: string) =>
  label
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const Avatar = ({ label = "", tint, size = "md", style }: Props) => {
  styles.useVariants({ size });

  return (
    <View style={[styles.container, tint ? { backgroundColor: tint } : null, style]}>
      <Text variant="label" weight="bold" style={styles.label}>
        {initials(label) || "·"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
    backgroundColor: theme.surfaceVariant,
    overflow: "hidden",

    variants: {
      size: {
        xs: { width: 20, height: 20 },
        sm: { width: 28, height: 28 },
        md: { width: 36, height: 36 },
        lg: { width: 48, height: 48 },
        xl: { width: 64, height: 64 },
      },
    },
  },

  label: {
    color: theme.onSurface,
    fontSize: 12,
  },
}));
