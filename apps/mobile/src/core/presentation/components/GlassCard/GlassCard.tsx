import type { PropsWithChildren } from "react";
import { Platform, View, type ViewProps } from "react-native";

import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { StyleSheet } from "react-native-unistyles";

const supportsLiquidGlass = Platform.OS === "ios" && isLiquidGlassAvailable();

export type GlassVariant = "regular" | "clear";
export type GlassElevation = "rest" | "raised" | "floating";

export type Props = {
  /** Liquid glass variant on iOS 26+; ignored on fallbacks. */
  variant?: GlassVariant;
  /** Elevation token from the theme — controls drop shadow. */
  elevation?: GlassElevation;
  /** Glow color (e.g. theme.primary) for active/highlighted state. Adds outer glow. */
  glowColor?: string;
  /** Border radius token. Defaults to "lg". */
  radius?: "md" | "lg" | "xl" | "2xl";
} & ViewProps;

/**
 * Card surface using iOS 26 Liquid Glass when available, falling back to
 * `expo-blur` on older iOS / Android, and to a flat themed surface on web.
 *
 * Use as the default container for content on top of brand backgrounds.
 */
export const GlassCard = ({
  children,
  variant = "regular",
  elevation = "raised",
  glowColor,
  radius = "lg",
  style,
  ...rest
}: PropsWithChildren<Props>) => {
  styles.useVariants({ elevation, radius });

  const containerStyle = [styles.container, glowColor ? styles.glow(glowColor) : null, style];

  if (supportsLiquidGlass) {
    return (
      <GlassView glassEffectStyle={variant} style={containerStyle} {...rest}>
        {children}
      </GlassView>
    );
  }

  if (Platform.OS === "ios" || Platform.OS === "android") {
    return (
      <View style={[containerStyle, styles.fallbackOverflow]} {...rest}>
        <BlurView intensity={40} tint="default" style={StyleSheet.absoluteFill} />
        <View style={styles.fallbackTint} />
        {children}
      </View>
    );
  }

  return (
    <View style={[containerStyle, styles.flatFallback]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    overflow: "hidden",
    borderCurve: "continuous",

    variants: {
      elevation: {
        rest: { boxShadow: theme.elevation.rest },
        raised: { boxShadow: theme.elevation.raised },
        floating: { boxShadow: theme.elevation.floating },
      },
      radius: {
        md: { borderRadius: theme.radius.md },
        lg: { borderRadius: theme.radius.lg },
        xl: { borderRadius: theme.radius.xl },
        "2xl": { borderRadius: theme.radius["2xl"] },
      },
    },
  },

  fallbackOverflow: {
    backgroundColor: "transparent",
  },

  fallbackTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.surfaceContainer,
    opacity: 0.6,
  },

  flatFallback: {
    backgroundColor: theme.surfaceContainer,
  },

  glow: (color: string) => ({
    boxShadow: `0 0 24px ${color}40, 0 1px 2px rgba(0,0,0,0.06)`,
  }),
}));
