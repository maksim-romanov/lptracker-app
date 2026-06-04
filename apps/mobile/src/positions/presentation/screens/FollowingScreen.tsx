import { ActivityIndicator, View } from "react-native";

import { container } from "core/di/container";
import { EmptyState } from "core/presentation/components";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { PositionCard } from "positions/presentation/components/PositionCard";
import { WidgetBanner } from "positions/presentation/components/WidgetBanner";
import { usePositionsQuery } from "positions/presentation/hooks/usePositionsQuery";
import { FollowingStore } from "positions/presentation/stores/following.store";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

export const FollowingScreen = observer(() => {
  const router = useRouter();
  const { data, isLoading } = usePositionsQuery();
  const followingStore = container.resolve(FollowingStore);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const followed = (data ?? []).filter((p) => followingStore.isFollowing(p));

  return (
    <Animated.FlatList
      data={followed}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[styles.list, followed.length === 0 && styles.listEmpty]}
      contentInsetAdjustmentBehavior="automatic"
      itemLayoutAnimation={LinearTransition.duration(220)}
      ListHeaderComponent={
        <View style={styles.header}>
          <WidgetBanner />
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <EmptyState icon="star-outline" title="Nothing followed yet" description="Star a position on its detail page to track it here." />
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      renderItem={({ item }) => (
        <Animated.View exiting={FadeOut.duration(180)}>
          <PositionCard
            position={item}
            favorite
            onToggleFavorite={() => followingStore.toggle(item)}
            onPress={() => router.push(`/positions/${item.id}`)}
          />
        </Animated.View>
      )}
    />
  );
});

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing["3xl"],
  },

  listEmpty: {
    flexGrow: 1,
  },

  header: {
    paddingBottom: theme.spacing.lg,
  },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 80,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
}));
