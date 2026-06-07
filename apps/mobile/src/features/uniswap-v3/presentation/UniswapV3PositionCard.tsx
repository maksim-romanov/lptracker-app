import { useMemo } from "react";

import { Box, Inline, Stack } from "@grapp/stacks";
import { Card, NetworkBadge, Tag, Text, TokensImages } from "core/presentation/components";
import type { TPositionByExt, TTokensMap } from "positions/domain/types";
import { StyleSheet } from "react-native-unistyles";

import { mapToVm } from "../data/uniswap-v3.mapper";
import type { TUniswapV3RangeStatus } from "../domain/uniswap-v3.vm";
import { PriceRangeBar } from "./components/PriceRangeBar";

interface IProps {
  readonly position: TPositionByExt<"uniswap-v3">;
  readonly tokens: TTokensMap;
}

const STATUS_TONE: Record<TUniswapV3RangeStatus, "success" | "warning" | "neutral"> = {
  "in-range": "success",
  "out-of-range": "warning",
  closed: "neutral",
};

const STATUS_LABEL: Record<TUniswapV3RangeStatus, string> = {
  "in-range": "In range",
  "out-of-range": "Out of range",
  closed: "Closed",
};

export const UniswapV3PositionCard = function UniswapV3PositionCard({ position, tokens }: IProps) {
  const vm = useMemo(() => mapToVm(position, tokens), [position, tokens]);
  const pairTokens = [
    { symbol: vm.pair.base.symbol, address: vm.pair.base.tokenRef.split(":")[1] },
    { symbol: vm.pair.quote.symbol, address: vm.pair.quote.tokenRef.split(":")[1] },
  ];

  return (
    <Card variant="outlined" padding="lg">
      <Stack space={3}>
        <Box direction="row" alignY="center" gap={2}>
          <TokensImages tokens={pairTokens} chainId={position.chainId} size="md" />
          <Box flex="fluid">
            <Text variant="title" weight="bold" numberOfLines={1} style={styles.pair}>
              {vm.pair.base.symbol}
              <Text variant="title" style={styles.pairSlash}>
                {" / "}
              </Text>
              {vm.pair.quote.symbol}
            </Text>
          </Box>
        </Box>

        <Inline space={1} alignY="center">
          <NetworkBadge chainId={position.chainId} size="sm" />
          <Tag tone="brand">V3</Tag>
          <Tag tone="neutral">{vm.feeTierLabel}</Tag>
          <Tag tone={STATUS_TONE[vm.status]}>{STATUS_LABEL[vm.status]}</Tag>
        </Inline>

        <PriceRangeBar
          currentTick={position.extension.pool.currentTick}
          tickLower={position.extension.tickLower}
          tickUpper={position.extension.tickUpper}
        />

        <Box direction="row" alignY="center">
          <Box flex="fluid">
            <Text variant="label" color="muted" uppercase>
              Current price
            </Text>
            <Text variant="mono" weight="bold">
              {vm.priceRange.currentLabel} {vm.pair.quote.symbol}
            </Text>
          </Box>
        </Box>
      </Stack>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  pair: {
    flexShrink: 1,
    letterSpacing: -0.4,
  },

  pairSlash: {
    color: theme.onSurfaceVariant,
    fontFamily: "Satoshi-Medium",
  },
}));
