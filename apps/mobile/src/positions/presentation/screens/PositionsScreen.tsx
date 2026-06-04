import { ActivityIndicator, FlatList, View } from "react-native";

import { container } from "core/di/container";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { PositionCard, type TPositionVM } from "positions/presentation/components/PositionCard";
import { usePositionsQuery } from "positions/presentation/hooks/usePositionsQuery";
import { FollowingStore } from "positions/presentation/stores/following.store";
import { StyleSheet } from "react-native-unistyles";

export const PositionsScreen = () => {
  const { data, isLoading } = usePositionsQuery();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      renderItem={({ item }) => <PositionRow position={item} />}
    />
  );
};

const PositionRow = observer(({ position }: { position: TPositionVM }) => {
  const router = useRouter();
  const followingStore = container.resolve(FollowingStore);

  return (
    <PositionCard
      position={position}
      favorite={followingStore.isFollowing(position)}
      onToggleFavorite={() => followingStore.toggle(position)}
      onPress={() => router.push(`/positions/${position.id}`)}
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
