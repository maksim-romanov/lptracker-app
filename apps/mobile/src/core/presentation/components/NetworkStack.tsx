import { View, type ViewStyle } from "react-native";

import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { NETWORK_ICON_DIAMETER, NetworkIcon } from "./NetworkIcon";
import { Text } from "./Text";

type Size = "xs" | "sm" | "md" | "lg";

const OVERLAP = 0.4;

type Props = {
  chainIds: number[];
  size?: Size;
  /** Maximum visible icons before showing a +N pill. */
  max?: number;
  style?: ViewStyle;
};

export const NetworkStack = ({ chainIds, size = "md", max, style }: Props) => {
  const { theme } = useUnistyles();

  if (chainIds.length === 0) return null;

  const limit = max ?? chainIds.length;
  const visible = chainIds.slice(0, limit);
  const overflow = chainIds.length - visible.length;
  const overlapPx = NETWORK_ICON_DIAMETER[size] * OVERLAP;

  return (
    <View style={[styles.row, style]}>
      {visible.map((id, idx) => (
        <NetworkIcon key={id} chainId={id} size={size} style={idx === 0 ? undefined : { marginLeft: -overlapPx }} />
      ))}
      {overflow > 0 ? (
        <View
          style={[
            styles.overflow(NETWORK_ICON_DIAMETER[size]),
            {
              marginLeft: -overlapPx,
              backgroundColor: theme.surfaceContainer,
              borderColor: theme.surface,
            },
          ]}
        >
          <Text variant="label" weight="bold" style={styles.overflowText}>
            +{overflow}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  overflow: (dim: number) => ({
    width: dim,
    height: dim,
    borderRadius: dim / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  }),

  overflowText: {
    color: theme.onSurface,
    fontSize: 10,
  },
}));
