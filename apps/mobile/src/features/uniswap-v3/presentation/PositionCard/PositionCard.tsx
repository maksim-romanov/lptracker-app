import { Box, Inline, Stack } from "@grapp/stacks";
import type { components } from "core/api-client/generated/gateway";
import { GlassCard, NetworkChip, PriceRangeBar, Tag, Text, TokensImages, ValuePill } from "core/presentation/components";
import { AnimatedFollowingTag, FeeBpsTag, InRangeTag } from "core/presentation/components/Tag";
import { pipe } from "fp-ts/lib/function";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { withFollowing } from "./withFollowing";
import { withMenu } from "./withMenu";

export type Props = {
  position: components["schemas"]["UniswapV3Position"];
  isFollowing: boolean;
};

export const PositionCard = pipe(
  ({ position, isFollowing }: Props) => {
    const { theme } = useUnistyles();
    const { pool, liquidity, unclaimedFees, tickLower, tickUpper } = position.data;

    const inRange = pool.currentTick >= tickLower && pool.currentTick <= tickUpper;
    const totalUnclaimedFees = unclaimedFees ? unclaimedFees.token0.USDValue + unclaimedFees.token1.USDValue : null;
    const totalLiquidity = liquidity.token0.USDValue + liquidity.token1.USDValue;

    return (
      <GlassCard elevation="raised" radius="xl" style={styles.container}>
        <Stack space={3}>
          <Box direction="row" alignY="center" gap={3}>
            <TokensImages tokens={[pool.token0, pool.token1]} chainId={position.chainId} size="sm" />

            <Box flex="fluid">
              <Text variant="title" numberOfLines={1} style={styles.pairName}>
                {pool.token0.symbol}
                <Text variant="title" style={styles.pairSlash}>
                  /
                </Text>
                {pool.token1.symbol}
              </Text>
            </Box>
          </Box>

          <Inline space={2} alignY="center">
            <NetworkChip network={position.chainId} />
            <Tag color={theme.primary}>V3</Tag>
            <FeeBpsTag feeBps={pool.feeTier} />
            <InRangeTag inRange={inRange} />
            <AnimatedFollowingTag active={isFollowing} />
          </Inline>

          <PriceRangeBar currentTick={pool.currentTick} tickLower={tickLower} tickUpper={tickUpper} />

          <Box direction="row" alignY="top">
            <Box flex="fluid">
              <ValuePill label="Fees earned" value={totalUnclaimedFees} size="md" emptyPlaceholder="—" abbreviated />
            </Box>
            <Box flex="fluid" alignX="right">
              <ValuePill label="Position" value={totalLiquidity} size="md" abbreviated style={styles.alignRight} />
            </Box>
          </Box>
        </Stack>
      </GlassCard>
    );
  },
  withMenu,
  withFollowing,
);

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },

  pairName: {
    flexShrink: 1,
    letterSpacing: -0.4,
    lineHeight: 26,
  },

  pairSlash: {
    color: theme.onSurfaceVariant,
    fontFamily: "Satoshi-Medium",
  },

  alignRight: {
    alignItems: "flex-end",
  },
}));
