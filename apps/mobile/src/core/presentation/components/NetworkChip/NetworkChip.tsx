import { View, type ViewProps } from "react-native";

import type { NetworkKey } from "@mars-909/theme";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "../Text";

const CHAIN_ID_TO_NETWORK: Record<number, NetworkKey> = {
  1: "ethereum",
  10: "optimism",
  56: "bnb",
  137: "polygon",
  8453: "base",
  42161: "arbitrum",
  43114: "avalanche",
};

export const networkFromChainId = (chainId: number | undefined): NetworkKey => {
  if (chainId == null) return "unknown";
  return CHAIN_ID_TO_NETWORK[chainId] ?? "unknown";
};

const LABELS: Record<NetworkKey, string> = {
  ethereum: "Ethereum",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  base: "Base",
  polygon: "Polygon",
  bnb: "BNB",
  avalanche: "Avalanche",
  tron: "Tron",
  solana: "Solana",
  unknown: "Unknown",
};

export type Props = {
  /** Network key OR an EVM chainId (auto-mapped to network) */
  network: NetworkKey | number;
  /** Compact form — no label, just colored dot */
  compact?: boolean;
  /** Override the displayed label (e.g. abbreviated) */
  label?: string;
} & Pick<ViewProps, "style">;

export const NetworkChip = ({ network, compact, label, style }: Props) => {
  const key = typeof network === "number" ? networkFromChainId(network) : network;
  const text = label ?? LABELS[key];

  styles.useVariants({ network: key });

  if (compact) {
    return <View style={[styles.dot, style]} />;
  }

  return (
    <View style={[styles.chip, style]}>
      <View style={styles.dot} />
      <Text variant="label" style={styles.label}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderCurve: "continuous",

    variants: {
      network: {
        ethereum: { backgroundColor: `${theme.networks.ethereum.fg}1F`, borderColor: `${theme.networks.ethereum.fg}33` },
        arbitrum: { backgroundColor: `${theme.networks.arbitrum.fg}1F`, borderColor: `${theme.networks.arbitrum.fg}33` },
        optimism: { backgroundColor: `${theme.networks.optimism.fg}1F`, borderColor: `${theme.networks.optimism.fg}33` },
        base: { backgroundColor: `${theme.networks.base.fg}1F`, borderColor: `${theme.networks.base.fg}33` },
        polygon: { backgroundColor: `${theme.networks.polygon.fg}1F`, borderColor: `${theme.networks.polygon.fg}33` },
        bnb: { backgroundColor: `${theme.networks.bnb.fg}1F`, borderColor: `${theme.networks.bnb.fg}33` },
        avalanche: { backgroundColor: `${theme.networks.avalanche.fg}1F`, borderColor: `${theme.networks.avalanche.fg}33` },
        tron: { backgroundColor: `${theme.networks.tron.fg}1F`, borderColor: `${theme.networks.tron.fg}33` },
        solana: { backgroundColor: `${theme.networks.solana.fg}1F`, borderColor: `${theme.networks.solana.fg}33` },
        unknown: { backgroundColor: `${theme.networks.unknown.fg}1F`, borderColor: `${theme.networks.unknown.fg}33` },
      },
    },
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.full,

    variants: {
      network: {
        ethereum: { backgroundColor: theme.networks.ethereum.fg },
        arbitrum: { backgroundColor: theme.networks.arbitrum.fg },
        optimism: { backgroundColor: theme.networks.optimism.fg },
        base: { backgroundColor: theme.networks.base.fg },
        polygon: { backgroundColor: theme.networks.polygon.fg },
        bnb: { backgroundColor: theme.networks.bnb.fg },
        avalanche: { backgroundColor: theme.networks.avalanche.fg },
        tron: { backgroundColor: theme.networks.tron.fg },
        solana: { backgroundColor: theme.networks.solana.fg },
        unknown: { backgroundColor: theme.networks.unknown.fg },
      },
    },
  },

  label: {
    variants: {
      network: {
        ethereum: { color: theme.networks.ethereum.fg },
        arbitrum: { color: theme.networks.arbitrum.fg },
        optimism: { color: theme.networks.optimism.fg },
        base: { color: theme.networks.base.fg },
        polygon: { color: theme.networks.polygon.fg },
        bnb: { color: theme.networks.bnb.fg },
        avalanche: { color: theme.networks.avalanche.fg },
        tron: { color: theme.networks.tron.fg },
        solana: { color: theme.networks.solana.fg },
        unknown: { color: theme.networks.unknown.fg },
      },
    },
  },
}));
