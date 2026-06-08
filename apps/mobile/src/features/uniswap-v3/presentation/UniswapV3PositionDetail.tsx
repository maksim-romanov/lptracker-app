import { useMemo } from "react";
import { type LayoutChangeEvent, View } from "react-native";

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
import { observer } from "mobx-react-lite";
import type { TPositionByExt, TTokensMap } from "positions/domain/types";
import { AiPredictCard } from "positions/presentation/components/AiPredictCard";
import { InvertPairButton } from "positions/presentation/components/InvertPairButton";
import { PositionViewPrefsStore } from "positions/presentation/stores/position-view-prefs.store";
import Animated, { useAnimatedRef, useScrollOffset, useSharedValue } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { OpenOnUniswapUseCase } from "../application/usecase/open-on-uniswap.usecase";
import { mapToVm } from "../data/uniswap-v3.mapper";
import type { TUniswapV3RangeStatus } from "../domain/uniswap-v3.vm";
import { PositionStickyPill } from "./components/PositionStickyPill";
import { PriceRangeBar } from "./components/PriceRangeBar";
import { Strip } from "./components/Strip";

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

export const UniswapV3PositionDetail = observer(function UniswapV3PositionDetail({ position, tokens }: IProps) {
  const viewPrefs = container.resolve(PositionViewPrefsStore);
  const inverted = viewPrefs.isInverted(position.ref);
  const vm = useMemo(() => mapToVm(position, tokens, inverted), [position, tokens, inverted]);

  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(animatedRef);
  const heroEndY = useSharedValue(0);

  const onHeroLayout = (e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    heroEndY.value = y + height;
  };

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
    <View style={styles.root}>
      <Animated.ScrollView
        ref={animatedRef}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        scrollEventThrottle={16}
      >
        <View onLayout={onHeroLayout}>
          <Card variant="outlined" padding="lg">
            <Stack space={5}>
              <Box direction="row" alignY="center" gap={3}>
                <TokensImages tokens={pairTokens} chainId={position.chainId} size="lg" />
                <Box flex="fluid">
                  <Box direction="row" alignY="center" gap={2}>
                    <Text variant="title" weight="bold" numberOfLines={1} style={styles.pair}>
                      {vm.pair.base.symbol}
                      <Text variant="title" style={styles.pairSlash}>
                        {" / "}
                      </Text>
                      {vm.pair.quote.symbol}
                    </Text>
                    <InvertPairButton positionRef={position.ref} size={20} />
                  </Box>
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
                  status={vm.status}
                />
              </Stack>
            </Stack>
          </Card>
        </View>

        <View style={styles.spacer} />

        <Stack space={4}>
          <Strip />

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

          <AiPredictCard />

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
      </Animated.ScrollView>

      <PositionStickyPill vm={vm} chainId={position.chainId} scrollOffset={scrollOffset} heroEndY={heroEndY} />
    </View>
  );
});

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
  root: {
    flex: 1,
  },

  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing["3xl"],
  },

  spacer: {
    height: theme.spacing.lg,
  },

  pair: {
    flexShrink: 1,
    letterSpacing: -0.4,
  },

  pairSlash: {
    color: theme.onSurfaceVariant,
    fontFamily: "Satoshi-Medium",
  },
}));
