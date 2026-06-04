import { ActivityIndicator, View } from "react-native";

import { container } from "core/di/container";
import { EmptyState, IconButton } from "core/presentation/components";
import { Stack as RouterStack } from "expo-router";
import { PositionDetailView } from "features/uniswap-v3/presentation/components/PositionDetailView";
import { observer } from "mobx-react-lite";
import { usePositionByIdQuery } from "positions/presentation/hooks/usePositionByIdQuery";
import { FollowingStore } from "positions/presentation/stores/following.store";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type TProps = {
  id: string;
};

export const PositionDetailScreen = observer(({ id }: TProps) => {
  const { data: position, isLoading } = usePositionByIdQuery(id);
  const followingStore = container.resolve(FollowingStore);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!position) {
    return (
      <View style={styles.empty}>
        <EmptyState icon="search-outline" title="Position not found" description="This position no longer exists or has been removed." />
      </View>
    );
  }

  const isFollowing = followingStore.isFollowing(position);

  const handleToggleFollow = () => {
    followingStore.toggle(position);
  };

  return (
    <>
      <RouterStack.Screen
        options={{
          headerRight: () => <FollowHeaderButton isFollowing={isFollowing} onPress={handleToggleFollow} />,
        }}
      />

      {(() => {
        switch (position.protocol) {
          case "uniswap-v3":
            return <PositionDetailView position={position} />;
        }
      })()}
    </>
  );
});

const FollowHeaderButton = observer(({ isFollowing, onPress }: { isFollowing: boolean; onPress: () => void }) => {
  const { theme } = useUnistyles();
  return (
    <IconButton
      name={isFollowing ? "star" : "star-outline"}
      iconSize="md"
      color={isFollowing ? theme.warning : theme.onSurface}
      onPress={onPress}
      size="sm"
      accessibilityLabel={isFollowing ? "Unfollow position" : "Follow position"}
    />
  );
});

const styles = StyleSheet.create(() => ({
  empty: {
    flex: 1,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
}));
