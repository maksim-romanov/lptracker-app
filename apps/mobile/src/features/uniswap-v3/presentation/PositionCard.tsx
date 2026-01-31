import { View } from "react-native";

import { Box, Column, Columns, Inline, Stack } from "@grapp/stacks";
import type { components } from "core/api-client/generated/gateway";
import { Text, TokenRatio, TokensImages } from "core/presentation/components";
import { AdaptiveTag, ChainTag, FeeBpsTag, InRangeTag } from "core/presentation/components/Tag";
import { Image } from "expo-image";
import numbro from "numbro";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  position: components["schemas"]["UniswapV3Position"];
};

export const PositionCard = ({ position }: Props) => {
  const { pool, liquidity, unclaimedFees, tickLower, tickUpper } = position.data;

  const inRange = pool.currentTick >= tickLower && pool.currentTick <= tickUpper;

  const totalUnclaimedFeesUSDValue = unclaimedFees && unclaimedFees?.token0.USDValue + unclaimedFees?.token1.USDValue;
  const totalLiquidityUSDValue = liquidity.token0.USDValue + liquidity.token1.USDValue;

  return (
    <Box style={styles.container} rowGap={8}>
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

          <Box>
            <TokensImages tokens={[pool.token0, pool.token1]} chainId={position.chainId} />

            {/* <View style={styles.uniswapUniLogoContainer}>
              <Image source="uniswap-uni-logo" contentFit="contain" style={styles.uniswapUniLogo} />
            </View> */}
          </Box>
        </Inline>
      </Stack>

      <Inline space={12}>
        <Columns space={6} defaultFlex="content" alignX="left">
          <Column flex="content">
            <Box>
              <Text color="muted" variant="bodySmall">
                Value
              </Text>

              <Text variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>
                {numbro(totalLiquidityUSDValue).formatCurrency({ average: true, mantissa: 2 })}
              </Text>
            </Box>
          </Column>

          <Column flex="content">
            <Box>
              <Text color="muted" variant="bodySmall">
                Fees {inRange && "🤑"}
              </Text>

              <Text variant="bodySmall" numberOfLines={1}>
                {totalUnclaimedFeesUSDValue ? numbro(totalUnclaimedFeesUSDValue).formatCurrency({ average: false, mantissa: 2 }) : "-"}
              </Text>
            </Box>
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

  uniswapUniLogoContainer: {
    width: 20,
    height: 20,
    borderRadius: 100,
    // overflow: "hidden",
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FF007A",
    alignItems: "center",
    justifyContent: "center",
  },

  uniswapUniLogo: {
    width: 15,
    height: 15,
  },
}));
