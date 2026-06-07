import { View, type ViewStyle } from "react-native";

import { NETWORKS } from "@mars-909/catalog";
import { type NetworkKey, networkColors } from "@mars-909/theme";
import { CHAIN_LOGOS } from "core/config/chain-logos";
import { Image } from "expo-image";
import { StyleSheet, type UnistylesVariants, useUnistyles } from "react-native-unistyles";

const CHAIN_BY_ID = new Map<number, { key: NetworkKey }>(NETWORKS.map((n) => [n.chainId, { key: n.slug as NetworkKey }]));

type Variants = UnistylesVariants<typeof styles>;

type Props = Variants & {
  chainId: number;
  /** Drops contrast for unselected/disabled states. */
  muted?: boolean;
  style?: ViewStyle;
};

export const NETWORK_ICON_DIAMETER: Record<NonNullable<Variants["size"]>, number> = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 56,
};

export const NetworkIcon = ({ chainId, size = "md", muted, style }: Props) => {
  const { theme } = useUnistyles();
  styles.useVariants({ size });

  const chain = CHAIN_BY_ID.get(chainId);
  if (!chain) return null;

  const palette = networkColors[chain.key];
  const dim = NETWORK_ICON_DIAMETER[size];
  const haloDim = dim * 1.18;
  const haloOpacity = muted ? 0 : 0.08;
  const glowRadius = muted ? 0 : dim * 0.18;
  const glowOpacity = muted ? 0 : 0.35;

  return (
    <View style={[styles.wrapper, { width: dim, height: dim }, style]}>
      <View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            width: haloDim,
            height: haloDim,
            borderRadius: haloDim / 2,
            top: (dim - haloDim) / 2,
            left: (dim - haloDim) / 2,
            backgroundColor: palette.base,
            opacity: haloOpacity,
          },
        ]}
      />
      <View
        style={[
          styles.coin,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: theme.surfaceContainer,
            borderColor: theme.surface,
            shadowColor: palette.base,
            shadowOpacity: glowOpacity,
            shadowRadius: glowRadius,
            opacity: muted ? 0.55 : 1,
          },
        ]}
      >
        <Image
          source={CHAIN_LOGOS[chain.key]}
          style={{ width: dim, height: dim, borderRadius: dim / 2 }}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={chain.key}
          transition={0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create((_theme) => ({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",

    variants: {
      size: {
        xs: {},
        sm: {},
        md: {},
        lg: {},
      },
    },
  },

  halo: {
    position: "absolute",
  },

  coin: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 1,
    overflow: "hidden",
  },
}));
