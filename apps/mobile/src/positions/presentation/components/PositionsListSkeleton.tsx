import { View } from "react-native";

import { StyleSheet } from "react-native-unistyles";

import { PositionCardSkeleton } from "./PositionCardSkeleton";

type Props = {
  count?: number;
};

export const PositionsListSkeleton = ({ count = 4 }: Props) => {
  const keys = Array.from({ length: count }, (_, i) => `position-skeleton-${i}`);
  return (
    <View style={styles.root}>
      {keys.map((key, i) => (
        <View key={key} style={i > 0 ? styles.spacer : undefined}>
          <PositionCardSkeleton />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },

  spacer: {
    marginTop: 14,
  },
}));
