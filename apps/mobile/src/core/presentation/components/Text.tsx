import type { TextProps as RNTextProps } from "react-native";
import { Text as RNText } from "react-native";

import { StyleSheet, type UnistylesVariants } from "react-native-unistyles";

type ComponentProps = UnistylesVariants<typeof styles>;
export type TextProps = RNTextProps & ComponentProps;

export const Text = ({ children, style, variant, color, weight, uppercase, center, ...props }: TextProps) => {
  styles.useVariants({ variant, color, weight, uppercase, center });

  return (
    <RNText style={[styles.text, style]} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create((theme) => ({
  text: {
    fontFamily: "Satoshi-Regular",
    fontSize: 15,
    lineHeight: 20,
    color: theme.onSurface,

    variants: {
      variant: {
        // 16/22 — iOS Callout / Material body. 1.38× ratio for paragraph reading.
        body: { fontSize: 15, lineHeight: 21 },

        // Hero / huge brand text (used sparingly — e.g., onboarding)
        display: {
          fontFamily: "Satoshi-Black",
          fontSize: 34,
          lineHeight: 40,
          letterSpacing: -0.6,
        },

        // Screen titles (sidebar/header)
        title: {
          fontFamily: "Satoshi-Bold",
          fontSize: 22,
          lineHeight: 28,
          letterSpacing: -0.3,
        },

        // Card titles, list section headers
        headline: {
          fontFamily: "Satoshi-Bold",
          fontSize: 17,
          lineHeight: 23,
          letterSpacing: -0.1,
        },

        // Secondary copy — 13pt is iOS Footnote; 1.46× for comfortable reading
        bodySmall: {
          fontSize: 13,
          lineHeight: 19,
        },

        // Chips, tab labels, metadata. Caps text wants wider tracking.
        label: {
          fontFamily: "Satoshi-Medium",
          fontSize: 12,
          lineHeight: 16,
          letterSpacing: 0.5,
        },

        // Numeric callouts (PnL, balances)
        mono: {
          fontFamily: "Menlo",
          fontSize: 14,
          lineHeight: 20,
        },
      },

      color: {
        muted: { color: theme.onSurfaceVariant },
        primary: { color: theme.primary },
        onPrimary: { color: theme.onPrimary },
        success: { color: theme.success },
        error: { color: theme.error },
        warning: { color: theme.warning },
      },

      weight: {
        regular: { fontFamily: "Satoshi-Regular" },
        medium: { fontFamily: "Satoshi-Medium" },
        bold: { fontFamily: "Satoshi-Bold" },
        black: { fontFamily: "Satoshi-Black" },
      },

      uppercase: {
        true: { textTransform: "uppercase" },
      },

      center: {
        true: { textAlign: "center" },
      },
    },
  },
}));
