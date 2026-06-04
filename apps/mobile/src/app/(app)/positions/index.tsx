import { useState } from "react";
import { FlatList, View } from "react-native";

import { useRouter } from "expo-router";
import { PositionCard } from "positions/presentation/components/PositionCard";
import { POSITIONS_MOCK } from "positions/presentation/mocks/positions.mock";
import { StyleSheet } from "react-native-unistyles";

const PositionsScreen = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["1"]));

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <FlatList
      data={POSITIONS_MOCK}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      renderItem={({ item }) => (
        <PositionCard
          position={item}
          favorite={favorites.has(item.id)}
          onToggleFavorite={() => toggleFavorite(item.id)}
          onPress={() => router.push(`/positions/${item.id}`)}
        />
      )}
    />
  );
};

export default PositionsScreen;

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing["3xl"],
  },
}));
