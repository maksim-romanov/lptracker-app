import type React from "react";
import { Pressable, View, type ViewStyle } from "react-native";

import { StyleSheet } from "react-native-unistyles";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
};

/**
 * Dashed-border surface. Used as soft-call-to-action ("Add wallet") and as
 * limit / upgrade banners.
 */
export const DashedBanner = ({ children, onPress, style }: Props) => {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create((theme) => ({
  container: {
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: theme.outline,
    padding: theme.spacing.xl,
    backgroundColor: "transparent",
  },

  pressed: {
    opacity: 0.6,
  },
}));
