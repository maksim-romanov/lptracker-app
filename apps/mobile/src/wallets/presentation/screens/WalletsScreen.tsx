import { FlatList, View } from "react-native";

import { container } from "core/di/container";
import { Icon, Placeholder } from "core/presentation/components";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { StyleSheet } from "react-native-unistyles";
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
  const router = useRouter();

  const handleEdit = (wallet: Wallet) => {
    router.push({
      pathname: "/wallets/[walletId]",
      params: { walletId: wallet.id },
    });
  };

  const handleDelete = (wallet: Wallet) => {
    store.remove(wallet.id);
  };

  const renderItem = ({ item }: { item: Wallet }) => (
    <WalletCard wallet={item} onPress={() => handleEdit(item)} onLongPress={() => handleDelete(item)} />
  );

  return (
    <FlatList
      data={store.wallets.slice()}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={EmptyComponent}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
    />
  );
});

const styles = StyleSheet.create((theme) => ({
  contentContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    flexGrow: 1,
  },

  separator: {
    height: theme.spacing.lg,
  },
}));
