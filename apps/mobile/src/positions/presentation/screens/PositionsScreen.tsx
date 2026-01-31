import { FlatList, View } from "react-native";

import type { components } from "core/api-client/generated/gateway";
import { Icon, Placeholder } from "core/presentation/components";
import { StyleSheet } from "react-native-unistyles";
import { PositionCard as UniswapV3PositionCard } from "src/features/uniswap-v3/presentation/PositionCard";

import { usePositionsQuery } from "../hooks/positions-query.hook";

type UniswapV3Position = components["schemas"]["UniswapV3Position"];
type PositionComponent = UniswapV3Position;

const DEV_WALLET = "0xdbc60ae662c91e0ae9457c815a71f5055adf4791";

const Separator = () => <View style={styles.separator} />;

const EmptyComponent = () => (
  <Placeholder icon={<Icon name="water-outline" size="xl" />} title="No positions" description="Your liquidity positions will appear here" />
);

const renderPositionCard = ({ item }: { item: PositionComponent }) => {
  if (item.protocol === "uniswap-v3") return <UniswapV3PositionCard position={item} />;
  return null;
};

export function PositionsScreen() {
  const { fetchNextPage, hasNextPage, data } = usePositionsQuery(DEV_WALLET);

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
}

const styles = StyleSheet.create((theme, rt) => ({
  contentContainer: {
    paddingHorizontal: theme.spacing.xl,
  },

  separator: {
    height: theme.spacing.lg,
  },
}));
