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
    ...theme.typography.body,
    color: theme.onSurface,

    variants: {
      // Every role comes straight from packages/theme, so a size can only ever be changed
      // in the token tree — there is nowhere here to drift away from it.
      variant: { ...theme.typography },

      color: {
        muted: { color: theme.onSurfaceVariant },
        primary: { color: theme.primary },
        onPrimary: { color: theme.onPrimary },
        success: { color: theme.success },
        error: { color: theme.error },
        warning: { color: theme.warning },
      },

      // Emphasis within the sans family. Applying this on top of a figure role (display,
      // figure, figureSmall) swaps the mono face out for the sans one and breaks column
      // alignment — those roles already pin their own weight.
      weight: {
        regular: { fontFamily: theme.fontFamily.sans },
        medium: { fontFamily: theme.fontFamily.sansMedium },
        semibold: { fontFamily: theme.fontFamily.sansSemiBold },
        bold: { fontFamily: theme.fontFamily.sansBold },
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
