import { View } from "react-native";

import { Box } from "@grapp/stacks";
import { Icon, Text } from "core/presentation/components";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export const SyncTipBanner = () => {
  const { theme } = useUnistyles();
  const accent = theme.primary;

  return (
    <View style={[styles.outer, { shadowColor: accent }]}>
      <View
        style={[
          styles.inner,
          {
            backgroundColor: `${accent}10`,
            borderColor: `${accent}33`,
          },
        ]}
      >
        <Box direction="row" alignY="center" gap={3}>
          <View style={[styles.iconBubble, { backgroundColor: `${accent}26`, borderColor: `${accent}55` }]}>
            <Icon name="time-outline" size="md" color={accent} />
          </View>
          <Box flex="fluid">
            <Text variant="body" weight="bold">
              Just added a position?
            </Text>
            <Text variant="bodySmall" color="muted">
              Give it a minute or two — we're syncing fresh data from the chain.
            </Text>
          </Box>
        </Box>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  outer: {
    borderRadius: theme.radius.lg,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },

  inner: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },

  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
}));
