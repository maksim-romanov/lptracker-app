import { useMemo } from "react";

import { Box, Inline, Stack } from "@grapp/stacks";
import { Tag, Text } from "core/presentation/components";
import { observer } from "mobx-react-lite";
import type { TPositionByExt, TTokensMap } from "positions/domain/types";
import { StyleSheet } from "react-native-unistyles";

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

export const ListBody = observer(function ListBody({ position, tokens }: IProps) {
  const vm = useMemo(() => mapToVm(position, tokens), [position, tokens]);

  const currentTick = position.extension.pool.currentTick;
  const tickLower = position.extension.tickLower;
  const tickUpper = position.extension.tickUpper;

  return (
    <Stack space={4}>
      <Inline space={2} alignY="center">
        <Tag tone="neutral">{vm.feeTierLabel}</Tag>
        <Tag tone={STATUS_TONE[vm.status]}>{STATUS_LABEL[vm.status]}</Tag>
      </Inline>

      <PriceRangeBar currentTick={currentTick} tickLower={tickLower} tickUpper={tickUpper} />

      <Stack space={1}>
        <Text variant="label" color="muted" uppercase>
          Principal
        </Text>
        <Box direction="row" alignY="center" gap={3}>
          {vm.principal.map((side) => (
            <TokenAmount key={side.tokenRef} side={side} />
          ))}
        </Box>
      </Stack>
    </Stack>
  );
});

const TokenAmount = function TokenAmount({ side }: { side: TUniswapV3TokenSide }) {
  return (
    <Box flex="fluid">
      <Text variant="mono" weight="bold" numberOfLines={1} style={styles.amount}>
        {side.formatted}
      </Text>
      <Text variant="label" color="muted" uppercase>
        {side.symbol}
      </Text>
    </Box>
  );
};

const styles = StyleSheet.create(() => ({
  amount: {
    letterSpacing: -0.2,
  },
}));
