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
        body: { fontSize: 15, lineHeight: 21 },

        display: {
          fontFamily: "Satoshi-Black",
          fontSize: 34,
          lineHeight: 40,
          letterSpacing: -0.6,
        },

        title: {
          fontFamily: "Satoshi-Bold",
          fontSize: 22,
          lineHeight: 28,
          letterSpacing: -0.3,
        },

        headline: {
          fontFamily: "Satoshi-Bold",
          fontSize: 17,
          lineHeight: 23,
          letterSpacing: -0.1,
        },

        bodySmall: {
          fontSize: 13,
          lineHeight: 19,
        },

        label: {
          fontFamily: "Satoshi-Medium",
          fontSize: 12,
          lineHeight: 16,
          letterSpacing: 0.5,
        },

        caption: {
          fontSize: 11,
          lineHeight: 14,
        },

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
