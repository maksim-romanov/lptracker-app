import { useEffect } from "react";
import { View } from "react-native";

import { container } from "core/di/container";
import { EmptyState, Text } from "core/presentation/components";
import { useLocalSearchParams } from "expo-router";
import { observer } from "mobx-react-lite";
import { StyleSheet } from "react-native-unistyles";
import { WalletForm } from "wallets/presentation/components/WalletForm";
import { WalletDraftStore } from "wallets/presentation/wallet-draft.store";
import { WalletsStore } from "wallets/presentation/wallets.store";

const EditWalletScreen = observer(() => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = container.resolve(WalletsStore);
  const wallet = store.wallets.find((w) => w.id === id);

  useEffect(() => {
    if (wallet) container.resolve(WalletDraftStore).initFromWallet(wallet);
  }, [id]);

  if (!wallet) {
    return (
      <View style={styles.empty}>
        <EmptyState title="Wallet not found" description="This wallet was removed or doesn't exist on this device." icon="wallet-outline" />
        <Text variant="bodySmall" color="muted" center>
          ID: {id}
        </Text>
      </View>
    );
  }

  return <WalletForm />;
});

export default EditWalletScreen;

const styles = StyleSheet.create((theme) => ({
  empty: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing["4xl"],
    gap: theme.spacing.lg,
  },
}));
