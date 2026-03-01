import { FlatList, View } from "react-native";

import { Inline } from "@grapp/stacks";
import { container } from "core/di/container";
import { Button, Icon, Placeholder } from "core/presentation/components";
import { Text } from "core/presentation/components/Text";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { WALLETS_STORE } from "wallets/di/tokens";
import type { Wallet } from "wallets/domain/entities/wallet.entity";
import type { WalletsStore } from "wallets/presentation/wallets.store";

import { WalletCard } from "../components/WalletCard";

const store = container.resolve<WalletsStore>(WALLETS_STORE);

const Separator = () => <View style={styles.separator} />;

const EmptyComponent = () => (
  <Placeholder icon={<Icon name="wallet-outline" size="xl" />} title="No wallets" description="Add a wallet to track your positions" />
);

export const WalletsScreen = observer(function WalletsScreen() {
  const { theme } = useUnistyles();
  const router = useRouter();

  const handleAdd = () => {
    router.push("/wallet-form");
  };

  const handleEdit = (wallet: Wallet) => {
    router.push(`/wallet-form?id=${wallet.id}`);
  };

  const handleDelete = (wallet: Wallet) => {
    store.remove(wallet.id);
  };

  const renderItem = ({ item }: { item: Wallet }) => (
    <WalletCard wallet={item} onPress={() => handleEdit(item)} onLongPress={() => handleDelete(item)} />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surface }]} edges={["top"]}>
      <View style={styles.header}>
        <Inline alignX="between" alignY="center">
          <Text variant="title">Wallets</Text>
          <Button title="Add" variant="outline" onPress={handleAdd} />
        </Inline>
      </View>

      <FlatList
        data={store.wallets.slice()}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.outlineVariant,
  },

  contentContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },

  separator: {
    height: theme.spacing.lg,
  },
}));
