import { ActivityIndicator, ScrollView, View } from "react-native";

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

  if (followed.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyRoot}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        <View style={styles.emptyBanner}>
          <WidgetBanner />
        </View>
        <View style={styles.emptyBody}>
          <EmptyState
            icon="star-outline"
            tint="warning"
            title="Nothing followed yet"
            description="Tap the star on any position to track it. Followed positions can be pinned to your home screen."
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <Animated.FlatList
      data={followed}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      itemLayoutAnimation={LinearTransition.duration(220)}
      ListHeaderComponent={
        <View style={styles.header}>
          <WidgetBanner />
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

  header: {
    paddingBottom: theme.spacing.lg,
  },

  center: {
    flex: 1,
  },

  emptyRoot: {
    flexGrow: 1,
  },

  emptyBanner: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },

  emptyBody: {
    flex: 1,
  },
}));
