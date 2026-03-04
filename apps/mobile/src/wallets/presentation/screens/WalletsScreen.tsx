import { Pressable, View } from "react-native";

import { container } from "core/di/container";
import { Icon, Placeholder } from "core/presentation/components";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import Animated, { LinearTransition } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { WALLETS_STORE } from "wallets/di/tokens";
import type { Wallet } from "wallets/domain/entities/wallet.entity";
import type { WalletsStore } from "wallets/presentation/wallets.store";

import { WalletCard } from "../components/WalletCard";
import { WalletCardMenu } from "../components/WalletCardMenu";

const Separator = () => <View style={styles.separator} />;

const EmptyComponent = () => (
  <Placeholder icon={<Icon name="wallet-outline" size="xl" />} title="No wallets" description="Add a wallet to track your positions" />
);

export const WalletsScreen = observer(function WalletsScreen() {
  const store = container.resolve<WalletsStore>(WALLETS_STORE);

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

  return (
    <Animated.FlatList
      itemLayoutAnimation={LinearTransition}
      data={store.wallets.slice()}
      renderItem={({ item }) => <WalletCardItem wallet={item} onEdit={handleEdit} onDelete={handleDelete} />}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={EmptyComponent}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
    />
  );
});

const WalletCardItem = observer(function WalletCardItem({
  wallet,
  onEdit,
  onDelete,
}: {
  wallet: Wallet;
  onEdit: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
}) {
  const store = container.resolve<WalletsStore>(WALLETS_STORE);

  return (
    <WalletCardMenu wallet={wallet} onEdit={() => onEdit(wallet)} onDelete={() => onDelete(wallet)}>
      <Pressable onPress={() => store.setActiveWallet(wallet.id)}>
        <WalletCard wallet={wallet} isActive={store.activeWalletId === wallet.id} />
      </Pressable>
    </WalletCardMenu>
  );
});

const styles = StyleSheet.create((theme) => ({
  contentContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    flexGrow: 1 / 2,
  },

  separator: {
    height: theme.spacing.lg,
  },
}));
