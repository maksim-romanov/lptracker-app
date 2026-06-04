import { FlatList, View } from "react-native";

import { useRouter } from "expo-router";
import { PositionCard, type PositionVM } from "positions/presentation/components/PositionCard";
import { WidgetBanner } from "positions/presentation/components/WidgetBanner";
import { StyleSheet } from "react-native-unistyles";

const FOLLOWING: PositionVM[] = [
  {
    id: "1",
    chainId: 1,
    pair: { token0: { symbol: "ETH", address: "0xeth" }, token1: { symbol: "USDC", address: "0xusdc" } },
    feeBps: 30,
    currentTick: 0,
    tickLower: -200,
    tickUpper: 200,
    feesEarnedUsd: 12.4,
    positionValueUsd: 1280,
  },
  {
    id: "2",
    chainId: 8453,
    pair: { token0: { symbol: "cbBTC", address: "0xcbbtc" }, token1: { symbol: "USDC", address: "0xusdc2" } },
    feeBps: 5,
    currentTick: 40,
    tickLower: -100,
    tickUpper: 100,
    feesEarnedUsd: 3.21,
    positionValueUsd: 540,
  },
];

const FollowingPositionsScreen = () => {
  const router = useRouter();
  return (
    <FlatList
      data={FOLLOWING}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      ListHeaderComponent={
        <View style={styles.header}>
          <WidgetBanner />
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      renderItem={({ item }) => (
        <PositionCard position={item} favorite onToggleFavorite={() => undefined} onPress={() => router.push(`/positions/${item.id}`)} />
      )}
    />
  );
};

export default FollowingPositionsScreen;

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing["3xl"],
  },

  header: {
    paddingBottom: theme.spacing.lg,
  },
}));
