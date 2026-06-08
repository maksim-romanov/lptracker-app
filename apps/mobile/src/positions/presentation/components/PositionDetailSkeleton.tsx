import { View } from "react-native";

import { Box, Inline, Stack } from "@grapp/stacks";
import { Card, Skeleton } from "core/presentation/components";
import { StyleSheet } from "react-native-unistyles";

export const PositionDetailSkeleton = () => (
  <View style={styles.root}>
    <Skeleton.Group show>
      <Stack space={4}>
        <Card variant="outlined" padding="lg">
          <Stack space={5}>
            <Box direction="row" alignY="center" gap={3}>
              <View style={styles.pairAvatar}>
                <Skeleton radius="round" width={44} height={44} />
                <View style={styles.pairAvatarOverlap}>
                  <Skeleton radius="round" width={44} height={44} />
                </View>
              </View>
              <Box flex="fluid">
                <Skeleton width={190} height={26} radius={6} />
              </Box>
            </Box>

            <Inline space={2} alignY="center">
              <Skeleton width={64} height={22} radius={11} />
              <Skeleton width={48} height={22} radius={11} />
              <Skeleton width={76} height={22} radius={11} />
            </Inline>

            <Stack space={2}>
              <Skeleton width="100%" height={12} radius={6} />
              <Box direction="row" alignY="top">
                <Box flex="fluid">
                  <Stack space={1}>
                    <Skeleton width={40} height={12} radius={4} />
                    <Skeleton width={80} height={22} radius={6} />
                  </Stack>
                </Box>
                <Box flex="fluid" alignX="center">
                  <Stack space={1}>
                    <Skeleton width={60} height={12} radius={4} />
                    <Skeleton width={80} height={22} radius={6} />
                  </Stack>
                </Box>
                <Box flex="fluid" alignX="right">
                  <View style={styles.colRight}>
                    <Stack space={1}>
                      <Skeleton width={40} height={12} radius={4} />
                      <Skeleton width={80} height={22} radius={6} />
                    </Stack>
                  </View>
                </Box>
              </Box>
            </Stack>
          </Stack>
        </Card>

        <Card variant="elevated" padding="lg">
          <Stack space={3}>
            <Skeleton width={130} height={20} radius={6} />
            <BreakdownRow />
            <BreakdownRow />
          </Stack>
        </Card>

        <Card variant="elevated" padding="lg">
          <Stack space={3}>
            <Skeleton width={160} height={20} radius={6} />
            <BreakdownRow />
            <BreakdownRow />
          </Stack>
        </Card>
      </Stack>
    </Skeleton.Group>
  </View>
);

const BreakdownRow = () => (
  <Box direction="row" alignY="center" gap={3}>
    <Skeleton radius="round" width={28} height={28} />
    <Box flex="fluid">
      <Skeleton width={80} height={16} radius={5} />
    </Box>
    <Skeleton width={100} height={18} radius={5} />
  </Box>
);

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },

  pairAvatar: {
    width: 78,
    height: 44,
    flexDirection: "row",
  },

  pairAvatarOverlap: {
    marginLeft: -10,
  },

  colRight: {
    alignItems: "flex-end",
  },
}));
