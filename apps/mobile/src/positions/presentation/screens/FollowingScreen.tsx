import { useCallback, useMemo } from "react";
import { ActivityIndicator, type ListRenderItem, ScrollView, View } from "react-native";

import { container } from "core/di/container";
import { EmptyState } from "core/presentation/components";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import type { TGatewayPosition, TTokensMap } from "positions/domain/types";
import { PositionListItem } from "positions/presentation/components/PositionListItem";
import { WidgetBanner } from "positions/presentation/components/WidgetBanner";
import { usePositionsQuery } from "positions/presentation/hooks/usePositionsQuery";
import { positionRoutes } from "positions/presentation/lib/routes";
import { FollowingStore } from "positions/presentation/stores/following.store";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { WalletsStore } from "wallets/presentation/wallets.store";

const Separator = () => <View style={styles.separator} />;

const keyExtractor = (p: TGatewayPosition) => p.ref;

const itemExit = FadeOut.duration(180);
const listTransition = LinearTransition.duration(220);

const ListHeader = () => (
  <View style={styles.header}>
    <WidgetBanner />
  </View>
);

export const FollowingScreen = observer(function FollowingScreen() {
  const walletsStore = container.resolve(WalletsStore);
  const followingStore = container.resolve(FollowingStore);
  const wallets = walletsStore.wallets.map((w) => ({
    address: w.address,
    chainIds: [...w.chainIds],
  }));
  const query = usePositionsQuery({ wallets });
  const router = useRouter();

  const positions = query.data?.positions ?? [];
  const tokens: TTokensMap = query.data?.tokens ?? {};
  const refs = Array.from(followingStore.refs);
  const followed = useMemo(() => positions.filter((p) => refs.includes(p.ref)), [positions, refs]);

  const handlePress = useCallback((ref: string) => router.push(positionRoutes.detail(ref)), [router]);

  const renderItem = useCallback<ListRenderItem<TGatewayPosition>>(
    ({ item }) => (
      <Animated.View exiting={itemExit}>
        <PositionListItem position={item} tokens={tokens} onPress={handlePress} />
      </Animated.View>
    ),
    [tokens, handlePress],
  );

  if (query.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (followed.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyRoot}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        <View style={styles.bannerSlot}>
          <WidgetBanner />
        </View>
        <View style={styles.beforeStack} />
        <EmptyState
          icon="star-outline"
          tint="warning"
          title="Nothing followed yet"
          description="Tap the star on any position to track it. Followed positions can be pinned to your home screen."
        />
        <View style={styles.afterStack} />
      </ScrollView>
    );
  }

  return (
    <Animated.FlatList
      data={followed}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      itemLayoutAnimation={listTransition}
      ListHeaderComponent={ListHeader}
      ItemSeparatorComponent={Separator}
      renderItem={renderItem}
      initialNumToRender={6}
      maxToRenderPerBatch={4}
      windowSize={7}
      removeClippedSubviews
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

  separator: {
    height: 14,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyRoot: {
    flexGrow: 1,
  },

  bannerSlot: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },

  beforeStack: {
    flex: 25,
  },

  afterStack: {
    flex: 75,
  },
}));
