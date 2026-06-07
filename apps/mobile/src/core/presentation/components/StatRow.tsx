import { Pressable } from "react-native";

import { Box } from "@grapp/stacks";
import { StyleSheet } from "react-native-unistyles";

import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

type Props = {
  label: string;
  value: string;
  onPress?: () => void;
  trailingIcon?: IconName;
};

export const StatRow = function StatRow({ label, value, onPress, trailingIcon }: Props) {
  const content = (
    <Box direction="row" alignY="center" gap={3} paddingY={2}>
      <Box flex="fluid">
        <Text variant="bodySmall" color="muted">
          {label}
        </Text>
      </Box>
      <Text variant="bodySmall" weight="medium">
        {value}
      </Text>
      {trailingIcon && <Icon name={trailingIcon} size="sm" color={styles.iconColor.color} />}
    </Box>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={4} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create((theme) => ({
  pressed: {
    opacity: 0.6,
  },

  iconColor: {
    color: theme.onSurfaceVariant,
  },
}));
