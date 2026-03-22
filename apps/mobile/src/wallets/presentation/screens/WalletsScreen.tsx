import { Pressable, View } from "react-native";

import { container } from "core/di/container";
import { Icon, Placeholder } from "core/presentation/components";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import Animated, { LinearTransition } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import type { Wallet } from "wallets/domain/entities/wallet.entity";
import { WalletsStore } from "wallets/presentation/wallets.store";

import { WalletCard } from "../components/WalletCard";
import { WalletCardMenu } from "../components/WalletCardMenu";

const Separator = () => <View style={styles.separator} />;

const EmptyComponent = () => (
  <Placeholder icon={<Icon name="wallet-outline" size="xl" />} title="No wallets" description="Add a wallet to track your positions" />
);

export const WalletsScreen = observer(function WalletsScreen() {
  const store = container.resolve(WalletsStore);
  const router = useRouter();

  const handleViewPositions = (wallet: Wallet) => {
    store.setActiveWallet(wallet.id);
    router.navigate("/(tabs)/positions");
  };

  const handleEdit = (wallet: Wallet) => {
    router.push(`/wallets/${wallet.id}/edit`);
  };

  const handleDelete = (wallet: Wallet) => {
    store.remove(wallet.id);
  };

  return (
    <Animated.FlatList
      itemLayoutAnimation={LinearTransition}
      data={store.wallets.slice()}
      renderItem={({ item }) => (
        <WalletCardMenu wallet={item} onViewPositions={() => handleViewPositions(item)} onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item)}>
          <Pressable onPress={() => handleEdit(item)}>
            <WalletCard wallet={item} isActive={store.activeWalletId === item.id} />
          </Pressable>
        </WalletCardMenu>
      )}
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
    flexGrow: 1 / 2,
  },

  separator: {
    height: theme.spacing.lg,
  },
}));
