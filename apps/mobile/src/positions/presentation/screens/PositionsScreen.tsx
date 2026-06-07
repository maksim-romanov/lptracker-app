import { ActivityIndicator, FlatList, View } from "react-native";

import { container } from "core/di/container";
import { observer } from "mobx-react-lite";
import { PositionListItem } from "positions/presentation/components/PositionListItem";
import { usePositionsQuery } from "positions/presentation/hooks/usePositionsQuery";
import { StyleSheet } from "react-native-unistyles";
import { WalletsStore } from "wallets/presentation/wallets.store";

export const PositionsScreen = observer(function PositionsScreen() {
  const walletsStore = container.resolve(WalletsStore);
  const wallets = walletsStore.wallets.map((w) => ({
    address: w.address,
    chainIds: [...w.chainIds],
  }));
  const query = usePositionsQuery({ wallets });

  if (query.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const positions = query.data?.positions ?? [];
  const tokens = query.data?.tokens ?? {};

  return (
    <FlatList
      data={positions}
      keyExtractor={(p) => p.ref}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      renderItem={({ item }) => <PositionListItem position={item} tokens={tokens} />}
      onEndReached={() => query.fetchNextPage()}
      onEndReachedThreshold={0.5}
    />
  );
});

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing["3xl"],
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
}));
