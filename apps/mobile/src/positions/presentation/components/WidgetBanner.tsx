import { Pressable, View } from "react-native";

import { Box } from "@grapp/stacks";
import { Icon, Text } from "core/presentation/components";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type Props = {
  onPress?: () => void;
};

export const WidgetBanner = ({ onPress }: Props) => {
  const { theme } = useUnistyles();

  return (
    <View style={[styles.outer, { shadowColor: theme.warning }]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.inner,
          {
            backgroundColor: `${theme.warning}14`,
            borderColor: `${theme.warning}40`,
          },
          pressed && styles.pressed,
        ]}
      >
        <Box direction="row" alignY="center" gap={3}>
          <Icon name="star" size="md" color={theme.warning} />
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
};

const styles = StyleSheet.create((theme) => ({
  outer: {
    borderRadius: theme.radius.lg,
    // iOS gold glow halo — colored shadow with zero offset.
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    // Android falls back to gray elevation (colored elevation unsupported).
    elevation: 6,
  },

  inner: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },

  pressed: {
    opacity: 0.7,
  },
}));
