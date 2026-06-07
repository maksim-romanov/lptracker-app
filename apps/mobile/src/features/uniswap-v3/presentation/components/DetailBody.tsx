import { useMemo } from "react";

import { Box, Inline, Stack } from "@grapp/stacks";
import { container } from "core/di/container";
import { Button, Card, Divider, Tag, Text } from "core/presentation/components";
import { truncateAddress } from "core/presentation/utils/format";
import { observer } from "mobx-react-lite";
import type { TPositionByExt, TTokensMap } from "positions/domain/types";
import { StyleSheet } from "react-native-unistyles";

import { OpenOnUniswapUseCase } from "../../application/usecase/open-on-uniswap.usecase";
import { mapToVm } from "../../data/uniswap-v3.mapper";
import type { TUniswapV3RangeStatus, TUniswapV3TokenSide } from "../../domain/uniswap-v3.vm";
import { PriceRangeBar } from "./PriceRangeBar";

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

export const DetailBody = observer(function DetailBody({ position, tokens }: IProps) {
  const vm = useMemo(() => mapToVm(position, tokens), [position, tokens]);

  const currentTick = position.extension.pool.currentTick;
  const tickLower = position.extension.tickLower;
  const tickUpper = position.extension.tickUpper;

  const handleOpenUniswap = () => {
    container
      .resolve(OpenOnUniswapUseCase)
      .execute({ chainId: position.chainId, nftTokenId: vm.nftTokenId })
      .catch(() => undefined);
  };

  return (
    <Stack space={4}>
      <Inline space={2} alignY="center">
        <Tag tone="neutral">{vm.feeTierLabel}</Tag>
        <Tag tone={STATUS_TONE[vm.status]}>{STATUS_LABEL[vm.status]}</Tag>
      </Inline>

      <Stack space={2}>
        <PriceRangeBar currentTick={currentTick} tickLower={tickLower} tickUpper={tickUpper} />
        <PriceLabels
          minLabel={vm.priceRange.minLabel}
          currentLabel={vm.priceRange.currentLabel}
          maxLabel={vm.priceRange.maxLabel}
          status={vm.status}
        />
      </Stack>

      <Card variant="elevated" padding="lg">
        <Stack space={3}>
          <Text variant="headline" weight="bold">
            Liquidity
          </Text>
          <Divider />
          <Stack space={3}>
            {vm.principal.map((side) => (
              <TokenRow key={side.tokenRef} side={side} />
            ))}
          </Stack>
        </Stack>
      </Card>

      {vm.fees.length > 0 && (
        <Card variant="elevated" padding="lg">
          <Stack space={3}>
            <Text variant="headline" weight="bold">
              Unclaimed fees
            </Text>
            <Divider />
            <Stack space={3}>
              {vm.fees.map((side) => (
                <TokenRow key={side.tokenRef} side={side} />
              ))}
            </Stack>
          </Stack>
        </Card>
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
            <StatRow label="Current tick" value={String(currentTick)} />
            <StatRow label="Range" value={`${tickLower} ↔ ${tickUpper}`} />
          </Stack>
        </Stack>
      </Card>

      <Button title="View on Uniswap" variant="outline" size="lg" icon="open-outline" iconPosition="trailing" onPress={handleOpenUniswap} />
    </Stack>
  );
});

const PriceLabels = function PriceLabels({
  minLabel,
  currentLabel,
  maxLabel,
  status,
}: {
  minLabel: string;
  currentLabel: string;
  maxLabel: string;
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
      </Box>
      <Box flex="fluid" alignX="center">
        <Text variant="label" color={currentColor} uppercase>
          Current
        </Text>
        <Text variant="mono" weight="bold">
          {currentLabel}
        </Text>
      </Box>
      <Box flex="fluid" alignX="right">
        <Text variant="label" color="muted" uppercase>
          Max
        </Text>
        <Text variant="mono" weight="medium">
          {maxLabel}
        </Text>
      </Box>
    </Box>
  );
};

const TokenRow = function TokenRow({ side }: { side: TUniswapV3TokenSide }) {
  return (
    <Box direction="row" alignY="center">
      <Box flex="fluid">
        <Text variant="body" weight="medium">
          {side.symbol}
        </Text>
      </Box>
      <Text variant="mono" weight="bold" style={styles.amount}>
        {side.formatted}
      </Text>
    </Box>
  );
};

const StatRow = function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <Box direction="row" alignY="center">
      <Box flex="fluid">
        <Text variant="label" color="muted" uppercase>
          {label}
        </Text>
      </Box>
      <Text variant="mono" weight="medium">
        {value}
      </Text>
    </Box>
  );
};

const styles = StyleSheet.create(() => ({
  amount: {
    letterSpacing: -0.2,
  },
}));
