import { View } from "react-native";

import { Button, Icon, Text } from "core/presentation/components";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export const UpgradeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Icon name="star" size="2xl" color={theme.warning} />
        <Text variant="title" weight="bold" center>
          Premium
        </Text>
        <Text variant="bodySmall" color="muted" center>
          Coming soon.
        </Text>
      </View>

      <View style={{ paddingBottom: insets.bottom + 12 }}>
        <Button title="Got it" variant="ghost" size="lg" onPress={() => router.back()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
}));
