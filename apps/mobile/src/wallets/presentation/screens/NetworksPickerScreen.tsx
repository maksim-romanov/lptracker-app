import { FlatList, Pressable, View } from "react-native";

import { CHAINS } from "core/config/chains";
import { container } from "core/di/container";
import { Icon, NetworkIcon, Text } from "core/presentation/components";
import { Stack as NavStack } from "expo-router";
import { observer } from "mobx-react-lite";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { WalletDraftStore } from "wallets/presentation/wallet-draft.store";

const CHAIN_LIST = Object.values(CHAINS);

export const NetworksPickerScreen = observer(() => {
  const draft = container.resolve(WalletDraftStore);
  const { theme } = useUnistyles();

  return (
    <View style={styles.root}>
      <NavStack.Screen options={{ title: `Networks · ${draft.chainIds.length} of ${CHAIN_LIST.length}` }} />
      <FlatList
        data={CHAIN_LIST}
        keyExtractor={(item) => item.key}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.outlineVariant }]} />}
        renderItem={({ item }) => {
          const selected = draft.chainIds.includes(item.id);
          return (
            <Pressable
              onPress={() => draft.toggleChain(item.id)}
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.surfaceContainer }]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={item.fullName}
            >
              <NetworkIcon chainId={item.id} size="md" />
              <View style={styles.body}>
                <Text variant="body" weight="bold">
                  {item.fullName}
                </Text>
                <Text variant="bodySmall" color="muted">
                  {item.label}
                </Text>
              </View>
              <View
                style={[
                  styles.check,
                  selected
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: "transparent", borderColor: theme.outline },
                ]}
              >
                {selected ? <Icon name="checkmark-outline" size="sm" color={theme.onPrimary} /> : null}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.surface,
  },

  list: {
    paddingVertical: theme.spacing.md,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.lg,
    minHeight: 64,
  },

  body: {
    flex: 1,
    gap: 2,
  },

  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  separator: {
    height: 0.5,
    marginLeft: theme.spacing.xl + 44 + theme.spacing.lg,
  },
}));
