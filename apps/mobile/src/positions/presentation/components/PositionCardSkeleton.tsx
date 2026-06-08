import { View } from "react-native";

import { Box, Inline, Stack } from "@grapp/stacks";
import { Card, Skeleton } from "core/presentation/components";
import { StyleSheet } from "react-native-unistyles";

export const PositionCardSkeleton = () => (
  <Card variant="outlined" padding="lg">
    <Skeleton.Group show>
      <Stack space={4}>
        <Box direction="row" alignY="center" gap={3}>
          <View style={styles.pairAvatar}>
            <Skeleton radius="round" width={36} height={36} />
            <View style={styles.pairAvatarOverlap}>
              <Skeleton radius="round" width={36} height={36} />
            </View>
          </View>
          <Box flex="fluid">
            <Skeleton width={160} height={22} radius={6} />
          </Box>
        </Box>

        <Inline space={2} alignY="center">
          <Skeleton width={64} height={22} radius={11} />
          <Skeleton width={48} height={22} radius={11} />
          <Skeleton width={76} height={22} radius={11} />
        </Inline>

        <Skeleton width="100%" height={12} radius={6} />

        <Box direction="row" alignY="top">
          <Box flex="fluid">
            <Stack space={1}>
              <Skeleton width={56} height={12} radius={4} />
              <Skeleton width={120} height={24} radius={6} />
            </Stack>
          </Box>
          <Box flex="fluid" alignX="right">
            <View style={styles.colRight}>
              <Stack space={1}>
                <Skeleton width={56} height={12} radius={4} />
                <Skeleton width={120} height={24} radius={6} />
              </Stack>
            </View>
          </Box>
        </Box>
      </Stack>
    </Skeleton.Group>
  </Card>
);

const styles = StyleSheet.create(() => ({
  pairAvatar: {
    width: 62,
    height: 36,
    flexDirection: "row",
  },

  pairAvatarOverlap: {
    marginLeft: -10,
  },

  colRight: {
    alignItems: "flex-end",
  },
}));
