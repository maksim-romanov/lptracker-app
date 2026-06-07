import { useMemo } from "react";

import { Box, Inline, Stack } from "@grapp/stacks";
import { container } from "core/di/container";
import {
  BreakdownCard,
  Button,
  Card,
  Divider,
  NetworkBadge,
  StatRow,
  Tag,
  Text,
  TokenAmountRow,
  TokensImages,
} from "core/presentation/components";
import { truncateAddress } from "core/presentation/utils/format";
import type { TPositionByExt, TTokensMap } from "positions/domain/types";
import { StyleSheet } from "react-native-unistyles";

import { OpenOnUniswapUseCase } from "../application/usecase/open-on-uniswap.usecase";
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

export const UniswapV3PositionDetail = function UniswapV3PositionDetail({ position, tokens }: IProps) {
  const vm = useMemo(() => mapToVm(position, tokens), [position, tokens]);

  const pairTokens = [
    { symbol: vm.pair.base.symbol, address: vm.pair.base.tokenRef.split(":")[1] },
    { symbol: vm.pair.quote.symbol, address: vm.pair.quote.tokenRef.split(":")[1] },
  ];

  const handleOpenUniswap = () => {
    container
      .resolve(OpenOnUniswapUseCase)
      .execute({ chainId: position.chainId, nftTokenId: vm.nftTokenId })
      .catch(() => undefined);
  };

  return (
    <Stack space={4}>
      <Card variant="outlined" padding="lg">
        <Stack space={5}>
          <Box direction="row" alignY="center" gap={3}>
            <TokensImages tokens={pairTokens} chainId={position.chainId} size="lg" />
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

          <Inline space={2} alignY="center">
            <NetworkBadge chainId={position.chainId} size="sm" />
            <Tag tone="brand">V3</Tag>
            <Tag tone="neutral">{vm.feeTierLabel}</Tag>
            <Tag tone={STATUS_TONE[vm.status]}>{STATUS_LABEL[vm.status]}</Tag>
          </Inline>

          <Stack space={2}>
            <PriceRangeBar
              currentTick={position.extension.pool.currentTick}
              tickLower={position.extension.tickLower}
              tickUpper={position.extension.tickUpper}
            />
            <PriceLabels
              minLabel={vm.priceRange.minLabel}
              currentLabel={vm.priceRange.currentLabel}
              maxLabel={vm.priceRange.maxLabel}
              quoteSymbol={vm.pair.quote.symbol}
              baseSymbol={vm.pair.base.symbol}
              status={vm.status}
            />
          </Stack>
        </Stack>
      </Card>

      <BreakdownCard title="Liquidity">
        {vm.principal.map((side) => (
          <TokenAmountRow
            key={side.tokenRef}
            tokenRef={side.tokenRef}
            symbol={side.symbol}
            iconUrl={side.iconUrl}
            formatted={side.formatted}
            chainId={position.chainId}
          />
        ))}
      </BreakdownCard>

      {vm.fees.length > 0 && (
        <BreakdownCard title="Unclaimed fees">
          {vm.fees.map((side) => (
            <TokenAmountRow
              key={side.tokenRef}
              tokenRef={side.tokenRef}
              symbol={side.symbol}
              iconUrl={side.iconUrl}
              formatted={side.formatted}
              chainId={position.chainId}
            />
          ))}
        </BreakdownCard>
      )}

      <Card variant="elevated" padding="lg">
        <Stack space={3}>
          <Text variant="headline" weight="bold">
            Pool
          </Text>
          <Divider />
          <Stack space={1}>
            <StatRow label="Address" value={truncateAddress(vm.poolAddress)} />
            <StatRow label="Fee tier" value={vm.feeTierLabel} />
          </Stack>
        </Stack>
      </Card>

      <Button title="View on Uniswap" variant="outline" size="lg" icon="open-outline" iconPosition="trailing" onPress={handleOpenUniswap} />
    </Stack>
  );
};

const PriceLabels = function PriceLabels({
  minLabel,
  currentLabel,
  maxLabel,
  quoteSymbol,
  status,
}: {
  minLabel: string;
  currentLabel: string;
  maxLabel: string;
  quoteSymbol: string;
  baseSymbol: string;
  status: TUniswapV3RangeStatus;
}) {
  const currentColor = status === "in-range" ? "success" : status === "out-of-range" ? "warning" : "muted";

  return (
    <Box direction="row" alignY="top">
      <Box flex="fluid">
        <Text variant="label" color="muted" uppercase>
          Min
        </Text>
        <Text variant="mono" weight="medium">
          {minLabel}
        </Text>
        <Text variant="label" color="muted">
          {quoteSymbol}
        </Text>
      </Box>
      <Box flex="fluid" alignX="center">
        <Text variant="label" color={currentColor} uppercase>
          Current
        </Text>
        <Text variant="mono" weight="bold">
          {currentLabel}
        </Text>
        <Text variant="label" color="muted">
          {quoteSymbol}
        </Text>
      </Box>
      <Box flex="fluid" alignX="right">
        <Text variant="label" color="muted" uppercase>
          Max
        </Text>
        <Text variant="mono" weight="medium">
          {maxLabel}
        </Text>
        <Text variant="label" color="muted">
          {quoteSymbol}
        </Text>
      </Box>
    </Box>
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
