import { View, type ViewStyle } from "react-native";

import { NETWORKS } from "@mars-909/catalog";
import { type NetworkKey, networkColors } from "@mars-909/theme";
import { StyleSheet, type UnistylesVariants } from "react-native-unistyles";

import { Text } from "./Text";

type Variants = UnistylesVariants<typeof styles>;

type Props = Variants & {
  chainId: number;
  /** When true, renders just a colored dot. */
  dot?: boolean;
  style?: ViewStyle;
};

const CHAIN_BY_ID = new Map<number, { key: NetworkKey; label: string }>(
  NETWORKS.map((n) => [n.chainId, { key: n.slug as NetworkKey, label: n.shortName }]),
);

export const NetworkBadge = ({ chainId, dot, size = "md", style }: Props) => {
  styles.useVariants({ size });
  const chain = CHAIN_BY_ID.get(chainId);
  if (!chain) return null;

  const color = networkColors[chain.key];

  if (dot) {
    return <View style={[styles.dot, { backgroundColor: color.base }, style]} />;
  }

  return (
    <View style={[styles.pill, { backgroundColor: color.soft, borderColor: color.base }, style]}>
      <View style={[styles.dot, { backgroundColor: color.base }]} />
      <Text variant="label" weight="bold" style={{ color: color.base }}>
        {chain.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    borderRadius: theme.radius.full,
    borderWidth: 1,

    variants: {
      size: {
        sm: { paddingHorizontal: theme.spacing.sm, paddingVertical: 2 },
        md: { paddingHorizontal: theme.spacing.md, paddingVertical: 4 },
      },
    },
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,

    variants: {
      size: {
        sm: { width: 6, height: 6, borderRadius: 3 },
        md: { width: 8, height: 8, borderRadius: 4 },
      },
    },
  },
}));
