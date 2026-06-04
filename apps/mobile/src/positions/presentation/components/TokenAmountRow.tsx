import { Box } from "@grapp/stacks";
import { Text, TokenImage } from "core/presentation/components";
import { formatAmount, formatUsd } from "core/presentation/utils/format";
import type { TokenAmountVM } from "positions/presentation/mocks/positions.mock";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  token: TokenAmountVM;
  chainId: number;
};

export const TokenAmountRow = ({ token, chainId }: Props) => (
  <Box direction="row" alignY="center" gap={3}>
    <TokenImage token={{ symbol: token.symbol, address: token.address }} chainId={chainId} size="sm" />
    <Box flex="fluid">
      <Text variant="body" weight="medium">
        {token.symbol}
      </Text>
    </Box>
    <Box alignX="right">
      <Text variant="mono" weight="medium" style={styles.right}>
        {formatAmount(token.amount)}
      </Text>
      <Text variant="bodySmall" color="muted" style={styles.right}>
        {formatUsd(token.usdValue)}
      </Text>
    </Box>
  </Box>
);

const styles = StyleSheet.create(() => ({
  right: {
    textAlign: "right",
  },
}));
