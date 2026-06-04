import { FlatList, View } from "react-native";

import { Box } from "@grapp/stacks";
import { container } from "core/di/container";
import { DashedBanner, EmptyState, Icon, Text } from "core/presentation/components";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import type { Wallet } from "wallets/domain/entities/wallet.entity";
import { SwipeableWalletCard } from "wallets/presentation/components/SwipeableWalletCard";
import type { WalletVM } from "wallets/presentation/components/WalletCard";
import { WalletsStore } from "wallets/presentation/wallets.store";

const WALLET_LIMIT = 2;

const NeutralAddIcon = withUnistyles(Icon, (theme) => ({ color: theme.onSurface }));
const PrimaryAddIcon = withUnistyles(Icon, (theme) => ({ color: theme.primary }));

const toVM = (wallet: Wallet): WalletVM => ({
  id: wallet.id,
  name: wallet.name,
  address: wallet.address,
  chainIds: wallet.chainIds,
});

export const WalletsScreen = observer(() => {
  const router = useRouter();
  const store = container.resolve(WalletsStore);
  const wallets = store.wallets.map(toVM);
  const atLimit = wallets.length >= WALLET_LIMIT;

  return (
    <FlatList
      data={wallets}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      ListHeaderComponent={
        <View style={styles.header}>
          {atLimit ? (
            <UpgradeSlot onPress={() => router.push("/wallets/upgrade")} />
          ) : (
            <AddWalletSlot onPress={() => router.push("/wallets/new")} />
          )}
        </View>
      }
      ListEmptyComponent={<EmptyState icon="wallet-outline" title="No wallets yet" description="Add an EVM address to start tracking." />}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      renderItem={({ item }) => <SwipeableWalletCard wallet={item} onPress={() => router.push(`/wallets/${item.id}`)} />}
    />
  );
});

const AddWalletSlot = ({ onPress }: { onPress: () => void }) => (
  <DashedBanner onPress={onPress}>
    <Box direction="row" alignY="center" gap={3}>
      <View style={styles.iconBubble}>
        <NeutralAddIcon name="add" size="md" />
      </View>
      <Box flex="fluid">
        <Text variant="body" weight="bold">
          Add wallet
        </Text>
        <Text variant="bodySmall" color="muted">
          Track any address — up to {WALLET_LIMIT} on the free tier.
        </Text>
      </Box>
    </Box>
  </DashedBanner>
);

const UpgradeSlot = ({ onPress }: { onPress: () => void }) => (
  <DashedBanner onPress={onPress}>
    <Box direction="row" alignY="center" gap={3}>
      <View style={styles.iconBubblePrimary}>
        <PrimaryAddIcon name="add" size="md" />
      </View>
      <Box flex="fluid">
        <Text variant="body" weight="bold" color="primary">
          Add more wallets
        </Text>
        <Text variant="bodySmall" color="muted">
          Free tier is limited to {WALLET_LIMIT} wallets. Upgrade to track unlimited addresses.
        </Text>
      </Box>
    </Box>
  </DashedBanner>
);

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing["3xl"],
  },

  header: {
    paddingBottom: theme.spacing.lg,
  },

  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surfaceContainer,
  },

  iconBubblePrimary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.primary}1F`,
  },
}));
