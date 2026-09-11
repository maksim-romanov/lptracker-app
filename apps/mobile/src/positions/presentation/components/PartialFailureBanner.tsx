import { View } from "react-native";

import { Box } from "@grapp/stacks";
import { Icon, Text } from "core/presentation/components";
import type { TPartialMeta } from "positions/data/gateway-positions.repository";
import { partialFailureLabel } from "positions/presentation/lib/partial-failure-label";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface Props {
  readonly failures: TPartialMeta["failures"];
}

export const PartialFailureBanner = ({ failures }: Props) => {
  const { theme } = useUnistyles();
  const accent = theme.warning;
  const label = partialFailureLabel(failures);

  if (!label) return null;

  return (
    <View style={[styles.outer, { shadowColor: accent }]}>
      <View style={[styles.inner, { backgroundColor: `${accent}14`, borderColor: `${accent}40` }]}>
        <Box direction="row" alignY="center" gap={3}>
          <View style={[styles.iconBubble, { backgroundColor: `${accent}26`, borderColor: `${accent}66` }]}>
            <Icon name="information-circle-outline" size="md" color={accent} />
          </View>
          <Box flex="fluid">
            <Text variant="body" weight="bold">
              {label}
            </Text>
            <Text variant="bodySmall" color="muted">
              Positions from this source may be missing until it recovers.
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
