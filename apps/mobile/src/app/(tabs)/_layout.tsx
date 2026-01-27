import { Platform } from "react-native";

import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
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
        <Icon sf="chart.bar.fill" drawable="bar_chart" />
        <Label>Positions</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="wallets">
        <Icon sf="wallet.pass.fill" drawable="account_balance_wallet" />
        <Label>Wallets</Label>
      </NativeTabs.Trigger>
    </ThemedNativeTabs>
  );
}
