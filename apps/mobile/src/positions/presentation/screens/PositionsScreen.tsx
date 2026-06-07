import { useCallback } from "react";
import { ActivityIndicator, FlatList, type ListRenderItem, View } from "react-native";

import { container } from "core/di/container";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import type { TGatewayPosition, TTokensMap } from "positions/domain/types";
import { PositionListItem } from "positions/presentation/components/PositionListItem";
import { usePositionsQuery } from "positions/presentation/hooks/usePositionsQuery";
import { positionRoutes } from "positions/presentation/lib/routes";
import { StyleSheet } from "react-native-unistyles";
import { WalletsStore } from "wallets/presentation/wallets.store";

const Separator = () => <View style={styles.separator} />;

const keyExtractor = (p: TGatewayPosition) => p.ref;

export const PositionsScreen = observer(function PositionsScreen() {
  const walletsStore = container.resolve(WalletsStore);
  const wallets = walletsStore.wallets.map((w) => ({
    address: w.address,
    chainIds: [...w.chainIds],
  }));
  const query = usePositionsQuery({ wallets });
  const router = useRouter();

  const handlePress = useCallback((ref: string) => router.push(positionRoutes.detail(ref)), [router]);
  const handleEndReached = useCallback(() => query.fetchNextPage(), [query.fetchNextPage]);

  const tokens: TTokensMap = query.data?.tokens ?? {};
  const renderItem = useCallback<ListRenderItem<TGatewayPosition>>(
    ({ item }) => <PositionListItem position={item} tokens={tokens} onPress={handlePress} />,
    [tokens, handlePress],
  );

  if (query.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const positions = query.data?.positions ?? [];

  return (
    <FlatList
      data={positions}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      ItemSeparatorComponent={Separator}
      renderItem={renderItem}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
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

  separator: {
    height: 14,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
}));
