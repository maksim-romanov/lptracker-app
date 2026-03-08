import Fontisto from "@expo/vector-icons/Fontisto";
import { Box, Column, Columns, Inline, Stack } from "@grapp/stacks";
import type { components } from "core/api-client/generated/gateway";
import { Text, TokenRatio, TokensImages } from "core/presentation/components";
import { ChainTag, FeeBpsTag, InRangeTag, Tag } from "core/presentation/components/Tag";
import { pipe } from "fp-ts/lib/function";
import numbro from "numbro";
import { StyleSheet } from "react-native-unistyles";

import { withMenu } from "./withMenu";

export type Props = {
  position: components["schemas"]["UniswapV3Position"];
  isFollowing?: boolean;
};

export const PositionCard = pipe(({ position, isFollowing }: Props) => {
  const { pool, liquidity, unclaimedFees, tickLower, tickUpper } = position.data;

  const inRange = pool.currentTick >= tickLower && pool.currentTick <= tickUpper;

  const totalUnclaimedFeesUSDValue = unclaimedFees && unclaimedFees?.token0.USDValue + unclaimedFees?.token1.USDValue;
  const totalLiquidityUSDValue = liquidity.token0.USDValue + liquidity.token1.USDValue;

  return (
    <Box style={styles.container} rowGap={8}>
      <Stack space={4}>
        <Columns alignY="top" space={4}>
          <Column flex="fluid">
            <Stack space={2}>
              <Box direction="row" alignY="center" gap={2} wrap="no-wrap">
                <Text variant="title" numberOfLines={1} style={styles.pairName}>
                  {pool.token0.symbol}/{pool.token1.symbol}
                </Text>

                {isFollowing && <Fontisto name="star" size={12} color="#FF007A" />}
              </Box>

              <Inline space={2}>
                <ChainTag chainId={position.chainId} />
                <Tag color="#FF007A">V3</Tag>
                <FeeBpsTag feeBps={pool.feeTier} />
                <InRangeTag inRange={inRange} />
              </Inline>
            </Stack>
          </Column>

          <Column flex="content">
            <TokensImages tokens={[pool.token0, pool.token1]} chainId={position.chainId} />
          </Column>
        </Columns>
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
}, withMenu);

const styles = StyleSheet.create((theme) => ({
  pairName: {
    flexShrink: 1,
  },
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
