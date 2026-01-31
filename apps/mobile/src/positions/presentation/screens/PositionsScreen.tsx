import { FlatList, View } from "react-native";

import type { components } from "core/api-client/generated/gateway";
import { StyleSheet } from "react-native-unistyles";
import { PositionCard as UniswapV3PositionCard } from "src/features/uniswap-v3/presentation/PositionCard";

import { usePositionsQuery } from "../hooks/positions-query.hook";

type UniswapV3Position = components["schemas"]["UniswapV3Position"];
type PositionComponent = UniswapV3Position;

const DEV_WALLET = "0x90a96ee97a8429c9e95475605697306cc57a9433";

const Separator = () => <View style={styles.separator} />;

const renderPositionCard = ({ item }: { item: PositionComponent }) => {
  if (item.protocol === "uniswap-v3") return <UniswapV3PositionCard position={item} />;
  return null;
};

export function PositionsScreen() {
  const { data, fetchNextPage, hasNextPage } = usePositionsQuery(DEV_WALLET);

  return (
    <FlatList
      data={data}
      renderItem={renderPositionCard}
      ItemSeparatorComponent={Separator}
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
