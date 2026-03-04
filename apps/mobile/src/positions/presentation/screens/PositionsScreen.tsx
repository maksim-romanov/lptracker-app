import { FlatList, View } from "react-native";

import type { components } from "core/api-client/generated/gateway";
import { container } from "core/di/container";
import { Icon, Placeholder } from "core/presentation/components";
import { observer } from "mobx-react-lite";
import { StyleSheet } from "react-native-unistyles";
import { PositionCard as UniswapV3PositionCard } from "src/features/uniswap-v3/presentation/PositionCard";
import { WALLETS_STORE } from "wallets/di/tokens";
import type { WalletsStore } from "wallets/presentation/wallets.store";

import { usePositionsQuery } from "../hooks/positions-query.hook";

type UniswapV3Position = components["schemas"]["UniswapV3Position"];
type PositionComponent = UniswapV3Position;

const Separator = () => <View style={styles.separator} />;

const EmptyComponent = () => (
  <Placeholder icon={<Icon name="water-outline" size="xl" />} title="No positions" description="Your liquidity positions will appear here" />
);

const renderPositionCard = ({ item }: { item: PositionComponent }) => {
  if (item.protocol === "uniswap-v3") return <UniswapV3PositionCard position={item} />;
  return null;
};

export const PositionsScreen = observer(function PositionsScreen() {
  const store = container.resolve<WalletsStore>(WALLETS_STORE);
  const { fetchNextPage, hasNextPage, data } = usePositionsQuery(store.activeWallet?.address);

  return (
    <FlatList
      data={data}
      renderItem={renderPositionCard}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={EmptyComponent}
      contentContainerStyle={styles.contentContainer}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
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
