import type React from "react";
import { type LayoutChangeEvent, View } from "react-native";

import { Box, Stack } from "@grapp/stacks";
import { CHAIN_BY_ID } from "core/config/chains";
import { container } from "core/di/container";
import { OpenExternalLinkUseCase } from "core/linking";
import { Button, Card, Divider, EmptyState, IconButton, ProtocolStrip, Text } from "core/presentation/components";
import { formatUsd, truncateAddress } from "core/presentation/utils/format";
import { Stack as RouterStack, useLocalSearchParams } from "expo-router";
import { observer } from "mobx-react-lite";
import { AiPredictCard } from "positions/presentation/components/AiPredictCard";
import { PositionHeroCard } from "positions/presentation/components/PositionHeroCard";
import { PositionStickyPill } from "positions/presentation/components/PositionStickyPill";
import { StatRow } from "positions/presentation/components/StatRow";
import { TokenAmountRow } from "positions/presentation/components/TokenAmountRow";
import { getPositionById, type PositionDetailVM } from "positions/presentation/mocks/positions.mock";
import { FollowingStore } from "positions/presentation/stores/following.store";
import Animated, { useAnimatedRef, useScrollOffset, useSharedValue } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const buildFollowingPosition = (position: PositionDetailVM) => ({
  protocol: "uniswap-v3" as const,
  chainId: position.chainId as 1 | 8453 | 42161,
  data: { id: position.id },
});

const uniswapPositionUrl = (chainId: number, id: string): string | null => {
  const chain = CHAIN_BY_ID.get(chainId);
  if (!chain) return null;
  return `https://app.uniswap.org/positions/v3/${chain.key}/${id}`;
};

const PositionDetailScreen = observer(() => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const position = getPositionById(id);
  const followingStore = container.resolve(FollowingStore);

  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(animatedRef);
  const heroEndY = useSharedValue(0);

  const onHeroLayout = (e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    heroEndY.value = y + height;
  };

  if (!position) {
    return (
      <View style={styles.empty}>
        <EmptyState icon="search-outline" title="Position not found" description="This position no longer exists or has been removed." />
      </View>
    );
  }

  const followingPosition = buildFollowingPosition(position);
  const isFollowing = followingStore.isFollowing(followingPosition);
  const uniswapUrl = uniswapPositionUrl(position.chainId, position.id);

  const handleToggleFollow = () => {
    followingStore.toggle(followingPosition);
  };

  const handleOpenUniswap = () => {
    if (!uniswapUrl) return;
    const openLink = container.resolve(OpenExternalLinkUseCase);
    openLink.execute({ url: uniswapUrl }).catch(() => undefined);
  };

  return (
    <>
      <RouterStack.Screen
        options={{
          headerRight: () => <FollowHeaderButton isFollowing={isFollowing} onPress={handleToggleFollow} />,
        }}
      />

      <View style={styles.root}>
        <Animated.ScrollView
          ref={animatedRef}
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          scrollEventThrottle={16}
        >
          <View onLayout={onHeroLayout}>
            <PositionHeroCard position={position} />
          </View>

          <View style={styles.spacer} />

          <Stack space={4}>
            <ProtocolStrip protocol={position.protocol} />

            <BreakdownCard title="Liquidity" totalUsd={position.positionValueUsd}>
              <TokenAmountRow token={position.liquidity.token0} chainId={position.chainId} />
              <TokenAmountRow token={position.liquidity.token1} chainId={position.chainId} />
            </BreakdownCard>

            <BreakdownCard title="Unclaimed fees" totalUsd={position.unclaimedFees.totalUsd}>
              <TokenAmountRow token={position.unclaimedFees.token0} chainId={position.chainId} />
              <TokenAmountRow token={position.unclaimedFees.token1} chainId={position.chainId} />
            </BreakdownCard>

            <AiPredictCard />

            <Card variant="elevated" padding="lg">
              <Stack space={3}>
                <Text variant="headline" weight="bold">
                  Pool
                </Text>
                <Divider />
                <Stack space={1}>
                  <StatRow label="Address" value={truncateAddress(position.pool.address)} />
                  <StatRow label="Fee tier" value={`${(position.pool.feeTier / 100).toFixed(2)}%`} />
                  <StatRow label="Current tick" value={String(position.pool.currentTick)} />
                  <StatRow label="Range" value={`${position.tickLower} ↔ ${position.tickUpper}`} />
                </Stack>
              </Stack>
            </Card>

            {uniswapUrl && (
              <Button
                title="View on Uniswap"
                variant="outline"
                size="lg"
                icon="open-outline"
                iconPosition="trailing"
                onPress={handleOpenUniswap}
              />
            )}
          </Stack>
        </Animated.ScrollView>

        <PositionStickyPill position={position} scrollOffset={scrollOffset} heroEndY={heroEndY} />
      </View>
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

const BreakdownCard = ({ title, totalUsd, children }: { title: string; totalUsd: number; children: React.ReactNode }) => (
  <Card variant="elevated" padding="lg">
    <Stack space={3}>
      <Box direction="row" alignY="center">
        <Box flex="fluid">
          <Text variant="headline" weight="bold">
            {title}
          </Text>
        </Box>
        <Text variant="headline" weight="bold">
          {formatUsd(totalUsd)}
        </Text>
      </Box>
      <Divider />
      <Stack space={3}>{children}</Stack>
    </Stack>
  </Card>
);

export default PositionDetailScreen;

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.surface,
  },

  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing["3xl"],
  },

  spacer: {
    height: theme.spacing.lg,
  },

  empty: {
    flex: 1,
  },
}));
