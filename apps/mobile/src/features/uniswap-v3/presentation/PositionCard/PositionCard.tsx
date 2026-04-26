import { Box, Column, Columns, Inline, Stack } from "@grapp/stacks";
import type { components } from "core/api-client/generated/gateway";
import { GlassCard, NetworkChip, Symbol, Tag, Text, TokenRatio, TokensImages, ValuePill } from "core/presentation/components";
import { FeeBpsTag, InRangeTag } from "core/presentation/components/Tag";
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

    const totalUnclaimedFeesUSDValue = unclaimedFees ? unclaimedFees.token0.USDValue + unclaimedFees.token1.USDValue : null;
    const totalLiquidityUSDValue = liquidity.token0.USDValue + liquidity.token1.USDValue;

    return (
      <GlassCard elevation="raised" radius="lg" style={styles.container}>
        <Box rowGap={4}>
          <Columns alignY="top" space={4}>
            <Column flex="fluid">
              <Stack space={2}>
                <Box direction="row" alignY="center" gap={2} wrap="no-wrap">
                  <Text variant="title" numberOfLines={1} style={styles.pairName}>
                    {pool.token0.symbol}/{pool.token1.symbol}
                  </Text>

                  {isFollowing ? <Symbol name="star.fill" color="primary" size="xs" /> : null}
                </Box>

                <Inline space={2}>
                  <NetworkChip network={position.chainId} />
                  <Tag color={theme.primary}>V3</Tag>
                  <FeeBpsTag feeBps={pool.feeTier} />
                  <InRangeTag inRange={inRange} />
                </Inline>
              </Stack>
            </Column>

            <Column flex="content">
              <TokensImages tokens={[pool.token0, pool.token1]} chainId={position.chainId} />
            </Column>
          </Columns>

          <Inline space={12}>
            <Columns space={6} defaultFlex="content" alignX="left">
              <Column flex="content">
                <ValuePill label="Value" value={totalLiquidityUSDValue} size="md" abbreviated />
              </Column>

              <Column flex="content">
                <ValuePill label="Fees" value={totalUnclaimedFeesUSDValue} size="sm" emptyPlaceholder="–" />
              </Column>
            </Columns>

            <Box flex="fluid" alignY="center">
              <TokenRatio
                chainId={position.chainId}
                token0={{ ...pool.token0, value: liquidity.token0.value, USDValue: liquidity.token0.USDValue }}
                token1={{ ...pool.token1, value: liquidity.token1.value, USDValue: liquidity.token1.USDValue }}
              />
            </Box>
          </Inline>
        </Box>
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
  },
}));
