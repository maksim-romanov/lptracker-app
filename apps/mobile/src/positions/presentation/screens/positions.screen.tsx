import { View } from "react-native";

import { Text } from "core/presentation/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export function PositionsScreen() {
  const { theme } = useUnistyles();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top"]}>
      <View style={[styles.header, { padding: theme.spacing.xl, borderBottomColor: theme.outlineVariant }]}>
        <Text variant="headline">Positions</Text>
      </View>

      <View style={[styles.content, { padding: theme.spacing["2xl"] }]}>
        <View style={styles.placeholder}>
          <Text variant="bodyLarge" color="primary">
            No positions yet
          </Text>

          <Text>Connect a wallet to see your DeFi positions</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 64,
  },
});
