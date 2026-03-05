import { View } from "react-native";

import { Box, Inline, Stack } from "@grapp/stacks";
import { Skeleton } from "core/presentation/components/Skeleton";
import { StyleSheet } from "react-native-unistyles";

export const PositionCardSkeleton = () => (
  <Box style={styles.container} rowGap={8}>
    <Stack space={4}>
      <Inline alignY="top" alignX="between">
        <Stack space={2}>
          <Skeleton width={140} height={20} />
          <Inline space={2}>
            <Skeleton width={60} height={20} borderRadius={10} />
            <Skeleton width={32} height={20} borderRadius={10} />
            <Skeleton width={48} height={20} borderRadius={10} />
            <Skeleton width={64} height={20} borderRadius={10} />
          </Inline>
        </Stack>

        <Skeleton width={48} height={28} borderRadius={14} />
      </Inline>
    </Stack>

    <Inline space={12}>
      <View style={styles.valueGroup}>
        <Skeleton width={36} height={14} />
        <Skeleton width={64} height={20} />
      </View>

      <View style={styles.valueGroup}>
        <Skeleton width={28} height={14} />
        <Skeleton width={48} height={16} />
      </View>

      <View style={styles.ratioContainer}>
        <Skeleton width="100%" height={8} borderRadius={4} />
      </View>
    </Inline>
  </Box>
);

export const PositionCardSkeletonList = () => (
  <>
    <PositionCardSkeleton />
    <View style={styles.separator} />
    <PositionCardSkeleton />
    <View style={styles.separator} />
    <PositionCardSkeleton />
  </>
);

const styles = StyleSheet.create((theme) => ({
  container: {
    overflow: "hidden",
    backgroundColor: theme.surfaceContainer,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: theme.outline,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },

  valueGroup: {
    gap: 4,
  },

  ratioContainer: {
    flex: 1,
    justifyContent: "center",
  },

  separator: {
    height: theme.spacing.lg,
  },
}));
