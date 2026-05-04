import { View, type ViewProps } from "react-native";

import type { NetworkKey } from "@mars-909/theme";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Tag, type TagSize } from "../Tag/Tag";

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

export const networkLabel = (network: NetworkKey | number): string => {
  const key = typeof network === "number" ? networkFromChainId(network) : network;
  return LABELS[key];
};

export type Props = {
  /** Network key OR an EVM chainId (auto-mapped to network) */
  network: NetworkKey | number;
  /** Compact form — no label, just colored dot */
  compact?: boolean;
  /** Override the displayed label (e.g. abbreviated) */
  label?: string;
  /** Tag size (default: sm) */
  size?: TagSize;
} & Pick<ViewProps, "style">;

export const NetworkChip = ({ network, compact, label, size = "sm", style }: Props) => {
  const { theme } = useUnistyles();
  const key = typeof network === "number" ? networkFromChainId(network) : network;
  const color = theme.networks[key].fg;
  const text = label ?? LABELS[key];

  if (compact) {
    return <View style={[styles.compactDot, { backgroundColor: color }, style]} />;
  }

  return (
    <Tag color={color} size={size} leading={<View style={[styles.dot, { backgroundColor: color }]} />} style={style}>
      {text}
    </Tag>
  );
};

const styles = StyleSheet.create(() => ({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  compactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
}));
