import React, { useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";

import type { components } from "core/api-client/generated/gateway";
import { container } from "core/di/container";
import { Icon, Placeholder } from "core/presentation/components";
import { observer } from "mobx-react-lite";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { PositionCard as UniswapV3PositionCard } from "src/features/uniswap-v3/presentation/PositionCard";
import { WALLETS_STORE } from "wallets/di/tokens";
import type { WalletsStore } from "wallets/presentation/wallets.store";

import { PositionCardSkeletonList } from "../components/PositionCardSkeleton";
import { useFollowing } from "../hooks/useFollowing";
import { usePositionsQuery } from "../hooks/usePositionsQuery";

type UniswapV3Position = components["schemas"]["UniswapV3Position"];
type PositionComponent = UniswapV3Position;

const Separator = () => <View style={styles.separator} />;

const EmptyComponent = () => (
  <Placeholder icon={<Icon name="water-outline" size="xl" />} title="No positions" description="Your liquidity positions will appear here" />
);

const PositionItem = React.memo(function PositionItem({ item }: { item: PositionComponent }) {
  const positionId = `${item.chainId}:${item.data.id}`;
  const { isFollowing } = useFollowing(positionId);

  if (item.protocol === "uniswap-v3") return <UniswapV3PositionCard position={item} isFollowing={isFollowing} />;

  return null;
});

const UnoRefreshControl = withUnistyles(RefreshControl);

const ITEM_HEIGHT = 300;

export const PositionsScreen = observer(function PositionsScreen() {
  const store = container.resolve<WalletsStore>(WALLETS_STORE);
  if (!store.activeWallet) throw new Error("No Active wallet");

  const { fetchNextPage, hasNextPage, data, isLoading, refetch } = usePositionsQuery(store.activeWallet.address);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <PositionItem item={item} />}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={isLoading ? PositionCardSkeletonList : EmptyComponent}
      contentContainerStyle={styles.contentContainer}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
      refreshControl={
        <UnoRefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          uniProps={(theme) => ({
            tintColor: theme.onSurface,
          })}
        />
      }
    />
  );
});

const styles = StyleSheet.create((theme, rt) => ({
  contentContainer: {
    paddingHorizontal: theme.spacing.xl,
    flexGrow: 2 / 3,
  },

  separator: {
    height: theme.spacing.lg,
  },
}));
