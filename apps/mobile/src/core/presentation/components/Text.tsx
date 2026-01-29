import type { TextProps as RNTextProps } from "react-native";
import { Text as RNText } from "react-native";

import { StyleSheet, type UnistylesVariants } from "react-native-unistyles";

type ComponentProps = UnistylesVariants<typeof styles>;
export type TextProps = RNTextProps & ComponentProps;

export function Text({ children, style, variant, color, uppercase, center, ...props }: TextProps) {
  styles.useVariants({ variant, color, uppercase, center });

  return (
    <RNText style={[styles.text, style]} {...props}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create((theme) => ({
  text: {
    fontFamily: "Satoshi-Regular",
    // fontWeight: "400",
    fontSize: { xs: 16, md: 18, lg: 20 },
    lineHeight: { xs: 24, md: 27, lg: 30 },
    letterSpacing: 0,
    color: theme.onSurface,

    variants: {
      variant: {
        display: {
          fontFamily: "Satoshi-Bold",
          // fontWeight: "700",
          fontSize: { xs: 36, md: 42, lg: 48 },
          lineHeight: { xs: 40, md: 46, lg: 53 },
          letterSpacing: 0,
        },

        headline: {
          fontFamily: "Satoshi-Black",
          // fontWeight: "600",
          fontSize: { xs: 24, md: 28, lg: 32 },
          lineHeight: { xs: 32, md: 37, lg: 42 },
          letterSpacing: 0,
        },

        bodyLarge: {
          fontFamily: "Satoshi-Medium",
          // fontWeight: "400",
          fontSize: { xs: 18, md: 20, lg: 22 },
          lineHeight: { xs: 28, md: 30, lg: 33 },
          letterSpacing: 0,
        },

        bodySmall: {
          fontFamily: "Satoshi-Regular",
          // fontWeight: "400",
          fontSize: { xs: 13, md: 15, lg: 16 },
          lineHeight: { xs: 20, md: 22, lg: 24 },
          letterSpacing: 0,
        },

        label: {
          fontFamily: "Satoshi-Medium",
          // fontWeight: "500",
          fontSize: { xs: 14, md: 16, lg: 17 },
          lineHeight: { xs: 20, md: 22, lg: 24 },
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
    // compoundVariants: [
    //   {
    //     inverse: true,
    //     color: "onPrimary",
    //     styles: {
    //       color: theme.inverseOnPrimary,
    //     },
    //   },
    // ],
  },
}));
