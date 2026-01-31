import { Box, Column, Columns, Inline, Stack } from "@grapp/stacks";
import type { components } from "core/api-client/generated/gateway";
import { Text } from "core/presentation/components";
import { AdaptiveTag, ChainTag, FeeBpsTag, InRangeTag } from "core/presentation/components/Tag";
import { TokensImages } from "core/presentation/components/TokenLogos";
import { Image } from "expo-image";
import numbro from "numbro";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  position: components["schemas"]["UniswapV3Position"];
};

export const PositionCard = ({ position }: Props) => {
  const { pool, liquidity, unclaimedFees, tickLower, tickUpper } = position.data;

  const inRange = pool.currentTick >= tickLower && pool.currentTick <= tickUpper;

  return (
    <Box style={styles.container} rowGap={8}>
      <Image source="uniswap-uni-logo" contentFit="contain" style={styles.uniswapUniLogo} />

      <Stack space={4}>
        <Inline alignY="top" alignX="between">
          <Stack space={2}>
            <Text variant="title">
              {pool.token0.symbol}/{pool.token1.symbol}
            </Text>

            <Inline space={2}>
              <ChainTag chainId={position.chainId} />
              <AdaptiveTag color="#FF007A">V3</AdaptiveTag>
              <FeeBpsTag feeBps={pool.feeTier} />
              <InRangeTag inRange={inRange} />
            </Inline>
          </Stack>

          <TokensImages tokens={[pool.token0, pool.token1]} chainId={position.chainId} />
        </Inline>
      </Stack>

      <Columns space={6} defaultFlex="content" alignX="left">
        <Column flex="content">
          <Box>
            <Text color="muted" variant="bodySmall">
              Value
            </Text>

            <Text variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>
              {numbro(liquidity.token0.USDValue + liquidity.token1.USDValue).formatCurrency({ average: true, mantissa: 2 })}
            </Text>
          </Box>
        </Column>

        <Column flex="content">
          <Box>
            <Text color="muted" variant="bodySmall">
              Fees {inRange && "🤑"}
            </Text>

            {unclaimedFees && (
              <Text variant="bodySmall" numberOfLines={1}>
                {numbro(unclaimedFees.token0.USDValue + unclaimedFees.token1.USDValue).formatCurrency({ average: false, mantissa: 2 })}
              </Text>
            )}
          </Box>
        </Column>
      </Columns>
    </Box>
  );
};

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

  uniswapUniLogo: {
    aspectRatio: 1,
    width: "50%",
    position: "absolute",
    right: 0,
    bottom: 0,
    opacity: 0.01,
  },
}));
