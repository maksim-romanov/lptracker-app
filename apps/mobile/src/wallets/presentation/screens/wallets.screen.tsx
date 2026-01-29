import { Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export function WalletsScreen() {
  const { theme } = useUnistyles();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top"]}>
      <View style={[styles.header, { padding: theme.spacing.xl, borderBottomColor: theme.outlineVariant }]}>
        <Text style={[theme.typography.headline, { color: theme.onBackground }]}>Wallets</Text>
      </View>

      <View style={[styles.content, { padding: theme.spacing["2xl"] }]}>
        <View style={styles.placeholder}>
          <Text style={[styles.placeholderIcon, { marginBottom: theme.spacing.lg }]}>👛</Text>
          <Text style={[theme.typography.bodyLarge, { color: theme.onSurface, marginBottom: theme.spacing.sm }]}>No wallets connected</Text>
          <Text style={[theme.typography.body, { color: theme.onSurfaceVariant, textAlign: "center" }]}>
            Add a wallet to track your positions
          </Text>
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
