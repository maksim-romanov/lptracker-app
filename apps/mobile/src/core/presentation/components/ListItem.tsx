import type React from "react";
import { Pressable, View, type ViewStyle } from "react-native";

import { StyleSheet } from "react-native-unistyles";

import { Icon } from "./Icon";
import { Text } from "./Text";

type Props = {
  title: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  style?: ViewStyle;
};

export const ListItem = ({ title, description, leading, trailing, onPress, destructive, style }: Props) => {
  const body = (
    <>
      {leading && <View style={styles.leading}>{leading}</View>}
      <View style={styles.body}>
        <Text variant="body" weight="medium" color={destructive ? "error" : undefined}>
          {title}
        </Text>
        {description && (
          <Text variant="bodySmall" color="muted">
            {description}
          </Text>
        )}
      </View>
      <View style={styles.trailing}>{trailing ?? (onPress ? <Icon name="chevron-forward-outline" size="sm" color="#71767B" /> : null)}</View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}>
        {body}
      </Pressable>
    );
  }
  return <View style={[styles.row, style]}>{body}</View>;
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.lg,
    minHeight: 56,
  },

  pressed: {
    backgroundColor: theme.surfaceContainer,
  },

  leading: {
    width: 32,
    alignItems: "center",
  },

  body: {
    flex: 1,
    gap: 2,
  },

  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
}));
