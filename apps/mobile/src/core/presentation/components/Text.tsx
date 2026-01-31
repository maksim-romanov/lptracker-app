import type { TextProps as RNTextProps } from "react-native";
import { Text as RNText } from "react-native";

import { StyleSheet, type UnistylesVariants } from "react-native-unistyles";

type ComponentProps = UnistylesVariants<typeof styles>;
export type TextProps = RNTextProps & ComponentProps;

export function Text({ children, style, variant, color, bold, uppercase, center, ...props }: TextProps) {
  styles.useVariants({ variant, color, bold, uppercase, center });

  return (
    <RNText style={[styles.text, style]} {...props}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create((theme) => ({
  text: {
    fontFamily: "Satoshi-Regular",
    fontSize: { xs: 16, md: 18, lg: 20 },
    lineHeight: { xs: 25.6, md: 28.8, lg: 32 },
    letterSpacing: 0,
    color: theme.onSurface,

    variants: {
      variant: {
        body: {},

        display: {
          fontFamily: "Satoshi-Black",
          fontSize: { xs: 32, md: 38, lg: 44 },
          lineHeight: { xs: 38.4, md: 45.6, lg: 52.8 },
          letterSpacing: 0,
        },

        title: {
          fontFamily: "Satoshi-Bold",
          fontSize: { xs: 22, md: 26, lg: 30 },
          lineHeight: { xs: 30.8, md: 36.4, lg: 42 },
          letterSpacing: 0,
        },

        headline: {
          fontFamily: "Satoshi-Bold",
          fontSize: { xs: 18, md: 21, lg: 24 },
          lineHeight: { xs: 25.2, md: 29.4, lg: 33.6 },
          letterSpacing: 0,
        },

        bodySmall: {
          fontFamily: "Satoshi-Regular",
          fontSize: { xs: 13, md: 15, lg: 16 },
          lineHeight: { xs: 19.5, md: 22.5, lg: 24 },
          letterSpacing: 0,
        },

        label: {
          fontFamily: "Satoshi-Medium",
          fontSize: { xs: 12, md: 14, lg: 15 },
          lineHeight: { xs: 19.6, md: 22.4, lg: 23.8 },
          letterSpacing: 0.5,
        },
      },

      color: {
        onSurfaceVariant: { color: theme.onSurfaceVariant },
        muted: { color: theme.onSurfaceVariant },
        primary: { color: theme.primary },
        onPrimary: { color: theme.onPrimary },
        error: { color: theme.error },
      },

      bold: {
        true: {
          fontFamily: "Satoshi-Bold",
        },
      },

      inverse: {
        true: {
          color: theme.inverseOnSurface,
        },
      },

      uppercase: {
        true: { textTransform: "uppercase" },
      },

      center: {
        true: { textAlign: "center" },
      },
    },

    compoundVariants: [
      {
        bold: true,
        variant: "bodySmall",
        styles: {
          fontFamily: "Satoshi-Medium",
        },
      },
    ],
  },
}));
