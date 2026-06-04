import { Box, Inline, Stack } from "@grapp/stacks";
import { Card, NetworkBadge, Tag, Text, TokensImages } from "core/presentation/components";
import { formatPrice, formatUsd } from "core/presentation/utils/format";
import { PriceRangeBar } from "features/uniswap-v3/presentation/components/PriceRangeBar";
import type { PositionDetailVM, PriceRangeVM } from "positions/data/fixtures/positions.fixtures";
import { StyleSheet } from "react-native-unistyles";

type TProps = {
  position: PositionDetailVM;
};

export const PositionHeroCard = ({ position }: TProps) => {
  const inRange = position.currentTick >= position.tickLower && position.currentTick <= position.tickUpper;

  return (
    <Card variant="outlined" padding="lg">
      <Stack space={5}>
        <Box direction="row" alignY="center" gap={3}>
          <TokensImages tokens={[position.pair.token0, position.pair.token1]} chainId={position.chainId} size="lg" />
          <Box flex="fluid">
            <Text variant="title" weight="bold" numberOfLines={1} style={styles.pair}>
              {position.pair.token0.symbol}
              <Text variant="title" style={styles.pairSlash}>
                {" / "}
              </Text>
              {position.pair.token1.symbol}
            </Text>
          </Box>
        </Box>

        <Inline space={2} alignY="center">
          <NetworkBadge chainId={position.chainId} size="sm" />
          <Tag tone="brand">V3</Tag>
          <Tag tone="neutral">{(position.feeBps / 100).toFixed(2)}%</Tag>
          <Tag tone={inRange ? "success" : "warning"}>{inRange ? "In range" : "Out of range"}</Tag>
        </Inline>

        <Stack space={1}>
          <Text variant="label" color="muted" uppercase>
            Position value
          </Text>
          <Text variant="display" weight="black">
            {formatUsd(position.positionValueUsd)}
          </Text>
        </Stack>

        <Stack space={2}>
          <PriceRangeBar currentTick={position.currentTick} tickLower={position.tickLower} tickUpper={position.tickUpper} />
          <PriceLabels price={position.price} inRange={inRange} />
        </Stack>
      </Stack>
    </Card>
  );
};

const PriceLabels = ({ price, inRange }: { price: PriceRangeVM; inRange: boolean }) => (
  <Box direction="row" alignY="top">
    <Box flex="fluid">
      <Text variant="label" color="muted" uppercase>
        Min
      </Text>
      <Text variant="mono" weight="medium">
        {formatPrice(price.min)}
      </Text>
    </Box>
    <Box flex="fluid" alignX="center">
      <Text variant="label" color={inRange ? "success" : "warning"} uppercase>
        Current
      </Text>
      <Text variant="mono" weight="bold">
        {formatPrice(price.current)}
      </Text>
    </Box>
    <Box flex="fluid" alignX="right">
      <Text variant="label" color="muted" uppercase>
        Max
      </Text>
      <Text variant="mono" weight="medium">
        {formatPrice(price.max)}
      </Text>
    </Box>
  </Box>
);

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
