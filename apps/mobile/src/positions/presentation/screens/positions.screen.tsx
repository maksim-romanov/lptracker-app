import { FlatList, View } from "react-native";

import { StyleSheet } from "react-native-unistyles";
import { PositionCard } from "src/features/uniswap-v3/presentation/PositionCard";

const Separator = () => <View style={styles.separator} />;

export function PositionsScreen() {
  return (
    <FlatList
      data={new Array(1000).fill(0)}
      renderItem={({ item }) => <PositionCard />}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={styles.contentContainer}
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
