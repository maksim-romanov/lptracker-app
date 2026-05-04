import { useState } from "react";
import { FlatList, type ListRenderItemInfo, RefreshControl, View } from "react-native";

import type { components } from "core/api-client/generated/gateway";
import { Icon, Placeholder } from "core/presentation/components";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { PositionCard as UniswapV3PositionCard } from "src/features/uniswap-v3/presentation/PositionCard";

import { container } from "core/di/container";
import { observer } from "mobx-react-lite";
import { WalletsStore } from "wallets/presentation/wallets.store";

import { PositionCardSkeletonList } from "../components/PositionCardSkeleton";
import { useFollowingPositionsQuery } from "../hooks/useFollowingPositionsQuery";
import { FollowingStore } from "../stores/following.store";

type UniswapV3Position = components["schemas"]["UniswapV3Position"];

const Separator = () => <View style={styles.separator} />;

const EmptyComponent = () => (
  <Placeholder icon={<Icon name="water-outline" size="xl" />} title="Following" description="Positions you follow will appear here" />
);

const renderPositionItem = ({ item }: ListRenderItemInfo<UniswapV3Position>) => {
  if (item.protocol === "uniswap-v3") return <UniswapV3PositionCard position={item} />;
  return null;
};

const UniRefreshControl = withUnistyles(RefreshControl);

const ITEM_HEIGHT = 300;

export const FollowingScreen = observer(function FollowingScreen() {
  const walletsStore = container.resolve(WalletsStore);
  const following = container.resolve(FollowingStore);
  const ids = walletsStore.activeWalletId ? following.getIds(walletsStore.activeWalletId) : [];
  const { data, isLoading, refetch } = useFollowingPositionsQuery(ids);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <FlatList
      data={data}
      renderItem={renderPositionItem}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={isLoading ? PositionCardSkeletonList : EmptyComponent}
      contentContainerStyle={styles.contentContainer}
      getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
      contentInsetAdjustmentBehavior="automatic"
      // Virtualization tuning — keeps mounted-card count low so iOS isn't
      // compositing dozens of GlassCards + Skia layers during big-title scroll.
      windowSize={5}
      initialNumToRender={5}
      maxToRenderPerBatch={4}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews
      refreshControl={
        <UniRefreshControl
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

const styles = StyleSheet.create((theme) => ({
  contentContainer: {
    paddingHorizontal: theme.spacing.xl,
    flexGrow: 2 / 3,
  },
  separator: {
    height: theme.spacing.lg,
  },
}));
