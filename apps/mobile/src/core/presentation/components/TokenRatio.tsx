import { Box, Inline } from "@grapp/stacks";
import numbro from "numbro";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";
import { TokenImage } from "./TokenImage";

type Token = {
  address: string;
  symbol: string;
  decimals: number;
  value: number;
  USDValue: number;
};

type TProps = {
  chainId: number | string;
  token0: Token;
  token1: Token;
};

const getRatio = (token0: Token, token1: Token) => {
  const totalUSDValue = token0.USDValue + token1.USDValue;
  return (token0.USDValue / totalUSDValue) * 100;
};

const formatNumber = (number: number) => {
  if (number === 0) return "0";
  return numbro(number).format({ mantissa: 2, average: true });
};

export const TokenRatio = ({ token0, token1, chainId }: TProps) => (
  <Box rowGap={0.5}>
    <Box style={styles.ratioBar}>
      <Box style={[styles.ratioBarFill, styles.ratioBarFill0, { width: `${getRatio(token0, token1)}%` }]} />
      <Box style={[styles.ratioBarFill, styles.ratioBarFill1, { width: `${getRatio(token1, token0)}%` }]} />
    </Box>

    <Inline alignX="between" marginX={-2}>
      <Inline alignY="center">
        <TokenImage token={token0} chainId={chainId} size="sm" />
        <Text variant="label">{formatNumber(token0.value)}</Text>
      </Inline>

      <Inline alignY="center">
        <Text variant="label">{formatNumber(token1.value)}</Text>
        <TokenImage token={token1} chainId={chainId} size="sm" />
      </Inline>
    </Inline>
  </Box>
);

const styles = StyleSheet.create((theme) => ({
  ratioBar: {
    height: 4,
    backgroundColor: "gray",
    borderRadius: 100,
    overflow: "hidden",
    flexDirection: "row",
  },

  ratioBarFill: {
    height: "100%",
  },

  ratioBarFill0: {
    backgroundColor: theme.primary,
  },

  ratioBarFill1: {
    backgroundColor: theme.secondary,
  },
}));
