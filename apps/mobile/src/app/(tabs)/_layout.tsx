import { Platform } from "react-native";

import { NativeTabs } from "expo-router/unstable-native-tabs";
import { withUnistyles } from "react-native-unistyles";

const ThemedNativeTabs = withUnistyles(NativeTabs, (theme) => ({
  iconColor: {
    default: theme.onSurfaceVariant,
    selected: Platform.select({ ios: theme.primary, android: theme.surface }),
  },
  indicatorColor: theme.primary,
  backgroundColor: theme.surface,
}));

export default function TabsLayout() {
  return (
    <ThemedNativeTabs minimizeBehavior="onScrollDown" labelVisibilityMode="labeled">
      <NativeTabs.Trigger name="positions">
        <NativeTabs.Trigger.Icon sf="chart.bar.fill" drawable="bar_chart" />
        <NativeTabs.Trigger.Label>Positions</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="following">
        <NativeTabs.Trigger.Icon sf="star.fill" drawable="star" />
        <NativeTabs.Trigger.Label>Following</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

    </ThemedNativeTabs>
  );
}
