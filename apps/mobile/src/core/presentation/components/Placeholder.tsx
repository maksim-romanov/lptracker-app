import type React from "react";
import { View, type ViewProps } from "react-native";

import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";

type TProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
} & Pick<ViewProps, "style">;

export function Placeholder({ icon, title, description, style }: TProps) {
  return (
    <View style={[styles.container, style]}>
      {icon}
      <Text variant="display" center style={styles.title}>
        {title}
      </Text>
      {description && (
        <Text color="onSurfaceVariant" center>
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing["5xl"],
    paddingHorizontal: theme.spacing["2xl"],
    gap: theme.spacing.sm,
    flexGrow: 0.9,
  },

  title: {
    marginTop: theme.spacing.sm,
  },
}));
