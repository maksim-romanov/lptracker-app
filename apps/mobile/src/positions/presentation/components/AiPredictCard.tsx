import { View } from "react-native";

import { Box, Stack } from "@grapp/stacks";
import { Icon, Text } from "core/presentation/components";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

const SparkleIcon = withUnistyles(Icon, (theme) => ({ color: theme.primary }));
const LockIcon = withUnistyles(Icon, (theme) => ({ color: theme.primary }));

const GradientFill = withUnistyles(LinearGradient, (theme) => ({
  colors: [`${theme.primary}26`, `${theme.primary}08`, "transparent"] as const,
}));

export const AiPredictCard = () => (
  <View style={styles.outer}>
    <View style={styles.border}>
      <GradientFill locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.inner}>
        <Stack space={4}>
          <Box direction="row" alignY="center">
            <View style={styles.sparkleBubble}>
              <SparkleIcon name="sparkles" size="lg" />
            </View>
            <Box flex="fluid" />
            <View style={styles.lockChip}>
              <LockIcon name="lock-closed" size="xs" />
              <Text variant="label" color="primary" weight="bold" uppercase style={styles.lockLabel}>
                Soon
              </Text>
            </View>
          </Box>

          <Stack space={2}>
            <Text variant="label" color="primary" weight="bold" uppercase style={styles.eyebrow}>
              AI Predict
            </Text>
            <Text variant="display" weight="black" style={styles.hook}>
              Tomorrow's range,{"\n"}today.
            </Text>
            <Text variant="bodySmall" color="muted">
              On-chain signals + ML — coming soon.
            </Text>
          </Stack>
        </Stack>
      </GradientFill>
    </View>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  outer: {
    borderRadius: theme.radius.lg,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 8,
  },

  border: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: `${theme.primary}66`,
    overflow: "hidden",
    backgroundColor: theme.surfaceContainer,
  },

  inner: {
    padding: theme.spacing.xl,
  },

  sparkleBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: `${theme.primary}80`,
    backgroundColor: `${theme.primary}26`,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 4,
  },

  lockChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: `${theme.primary}66`,
    backgroundColor: `${theme.primary}1A`,
  },

  lockLabel: {
    letterSpacing: 1.2,
  },

  eyebrow: {
    letterSpacing: 1.6,
  },

  hook: {
    letterSpacing: -0.8,
    lineHeight: 38,
  },
}));
