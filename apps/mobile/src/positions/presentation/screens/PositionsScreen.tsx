import { useCallback } from "react";
import { FlatList, type ListRenderItem, ScrollView, View } from "react-native";

import { container } from "core/di/container";
import { EmptyState } from "core/presentation/components";
import { type Href, useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import type { TGatewayPosition, TTokensMap } from "positions/domain/types";
import { PositionListItem } from "positions/presentation/components/PositionListItem";
import { PositionsListSkeleton } from "positions/presentation/components/PositionsListSkeleton";
import { SyncTipBanner } from "positions/presentation/components/SyncTipBanner";
import { usePositionsQuery } from "positions/presentation/hooks/usePositionsQuery";
import { positionRoutes } from "positions/presentation/lib/routes";
import { StyleSheet } from "react-native-unistyles";
import { WalletsStore } from "wallets/presentation/wallets.store";

const Separator = () => <View style={styles.separator} />;

const keyExtractor = (p: TGatewayPosition) => p.ref;

const ListFooter = () => (
  <View style={styles.footer}>
    <SyncTipBanner />
  </View>
);

export const PositionsScreen = observer(function PositionsScreen() {
  const walletsStore = container.resolve(WalletsStore);
  const router = useRouter();

  const wallets = walletsStore.wallets.map((w) => ({
    address: w.address,
    chainIds: [...w.chainIds],
  }));
  const query = usePositionsQuery({ wallets });

  const handlePress = useCallback((ref: string) => router.push(positionRoutes.detail(ref)), [router]);

  const tokens: TTokensMap = query.data?.tokens ?? {};
  const renderItem = useCallback<ListRenderItem<TGatewayPosition>>(
    ({ item }) => <PositionListItem position={item} tokens={tokens} onPress={handlePress} />,
    [tokens, handlePress],
  );

  if (wallets.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.emptyRoot} contentInsetAdjustmentBehavior="automatic" scrollEnabled={false}>
        <View style={styles.beforeStack} />
        <EmptyState
          icon="wallet-outline"
          tint="primary"
          title="No wallets yet"
          description="Add a wallet to start tracking positions across the networks you care about."
          actionLabel="Add wallet"
          actionIcon="add-outline"
          onAction={() => router.push("/wallets/new" as Href)}
        />
        <View style={styles.afterStack} />
      </ScrollView>
    );
  }

  if (query.isLoading) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        <PositionsListSkeleton />
      </ScrollView>
    );
  }

  const positions = query.data?.positions ?? [];

  if (positions.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.emptyRoot} contentInsetAdjustmentBehavior="automatic" scrollEnabled={false}>
        <View style={styles.bannerSlot}>
          <SyncTipBanner />
        </View>
        <View style={styles.beforeStack} />
        <EmptyState
          icon="stats-chart-outline"
          tint="primary"
          title="No positions found"
          description="We didn't find any positions for your wallets yet. Try adding another wallet or a different network."
          actionLabel="Add wallet"
          actionIcon="add-outline"
          onAction={() => router.push("/wallets/new" as Href)}
        />
        <View style={styles.afterStack} />
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={positions}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      ItemSeparatorComponent={Separator}
      ListFooterComponent={ListFooter}
      renderItem={renderItem}
      initialNumToRender={8}
      maxToRenderPerBatch={4}
      windowSize={7}
    />
  );
});

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing["3xl"],
  },

  footer: {
    paddingTop: theme.spacing.lg,
  },

  separator: {
    height: 14,
  },

  emptyRoot: {
    flexGrow: 1,
  },

  bannerSlot: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },

  beforeStack: {
    flex: 25,
  },

  afterStack: {
    flex: 75,
  },
}));
