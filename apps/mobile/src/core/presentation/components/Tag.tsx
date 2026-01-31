import type React from "react";
import { View, type ViewProps } from "react-native";

import numbro from "numbro";
import { StyleSheet, type UnistylesVariants, useUnistyles, withUnistyles } from "react-native-unistyles";
import tinycolor from "tinycolor2";
import { arbitrum } from "viem/chains";

import { Text } from "./Text";

export type TComponentVariants = UnistylesVariants<typeof styles>;

export type TProps = {
  colors: {
    surface: string;
    onSurface: string;
    outline: string;
  };

  glow?: boolean;
} & Pick<ViewProps, "style"> &
  TComponentVariants;

export const Tag = ({ children, colors, glow, rounded, style }: React.PropsWithChildren<TProps>) => {
  styles.useVariants({ rounded });

  return (
    <View
      style={[styles.container, glow && styles.shadow(colors.outline), { backgroundColor: colors.surface, borderColor: colors.outline }, style]}
    >
      <Text variant="label" style={[styles.text, { color: colors.onSurface }]}>
        {children}
      </Text>
    </View>
  );
};

export const AdaptiveTag = ({ children, color, rounded, style }: React.PropsWithChildren<Omit<TProps, "colors"> & { color: string }>) => {
  const colors = {
    surface: tinycolor(color).setAlpha(0.2).toRgbString(),
    onSurface: color,
    outline: tinycolor(color).setAlpha(0.1).toRgbString(),
    shadow: tinycolor(color).setAlpha(0.2).toRgbString(),
  };

  return (
    <Tag glow colors={colors} rounded={rounded} style={style}>
      {children}
    </Tag>
  );
};

export const ChainTag = ({ chainId }: { chainId: number }) => {
  if (chainId === arbitrum.id) return <AdaptiveTag color="#28A0F0">ARB</AdaptiveTag>;
  return null;
};

export const FeeBpsTag = ({ feeBps }: { feeBps: number }) => {
  const { theme } = useUnistyles();

  return (
    <AdaptiveTag color={theme.secondary}>
      {numbro(feeBps / 1_000_000).format({
        output: "percent",
        mantissa: 2,
        trimMantissa: true,
        spaceSeparated: false,
      })}
    </AdaptiveTag>
  );
};

export const InRangeTag = ({ inRange }: { inRange: boolean }) => {
  if (inRange) return <SuccessTag glow>In Range</SuccessTag>;
  return <WarningTag>Out of Range</WarningTag>;
};

export const WarningTag = withUnistyles(Tag, (theme) => ({
  colors: {
    surface: theme.warning,
    onSurface: theme.onWarning,
    outline: theme.warning,
    shadow: theme.warning,
  },
}));

export const SuccessTag = withUnistyles(AdaptiveTag, (theme) => ({ color: theme.success }));

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.spacing.xs,
    borderWidth: 1,

    variants: {
      rounded: {
        true: {
          borderRadius: theme.spacing.xl,
          paddingHorizontal: theme.spacing.sm,
        },
      },
    },
  },

  text: {
    textTransform: "capitalize",
  },

  shadow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.75,
    shadowRadius: 4,
    elevation: 5,
  }),
}));
