import { Box } from "@grapp/stacks";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";
import { TokenImage } from "./TokenImage";

type Props = {
  tokenRef: string;
  symbol: string;
  iconUrl: string;
  formatted: string;
  chainId: number;
};

export const TokenAmountRow = function TokenAmountRow({ tokenRef, symbol, iconUrl, formatted, chainId }: Props) {
  const address = tokenRef.split(":")[1];

  return (
    <Box direction="row" alignY="center" gap={3}>
      <TokenImage token={{ symbol, address }} chainId={chainId} imageUrl={iconUrl || undefined} size="sm" />
      <Box flex="fluid">
        <Text variant="body" weight="medium">
          {symbol}
        </Text>
      </Box>
      <Box alignX="right">
        <Text variant="mono" weight="bold" style={styles.right}>
          {formatted}
        </Text>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create(() => ({
  right: {
    textAlign: "right",
  },
}));
