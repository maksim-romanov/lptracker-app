import { Pressable, View } from "react-native";

import { Box } from "@grapp/stacks";
import { Icon, Text } from "core/presentation/components";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

const StarIcon = withUnistyles(Icon, (theme) => ({ color: theme.warning }));

type Props = {
  onPress?: () => void;
};

export const WidgetBanner = ({ onPress }: Props) => (
  <View style={styles.outer}>
    <Pressable onPress={onPress} style={({ pressed }) => [styles.inner, pressed && styles.pressed]}>
      <Box direction="row" alignY="center" gap={3}>
        <StarIcon name="star" size="md" />
        <Box flex="fluid">
          <Text variant="body" weight="bold">
            Add to Home Screen
          </Text>
          <Text variant="bodySmall" color="muted">
            Pin following positions as a live iOS widget.
          </Text>
        </Box>
      </Box>
    </Pressable>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  outer: {
    borderRadius: theme.radius.lg,
    shadowColor: theme.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },

  inner: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: `${theme.warning}14`,
    borderColor: `${theme.warning}40`,
  },

  pressed: {
    opacity: 0.7,
  },
}));
