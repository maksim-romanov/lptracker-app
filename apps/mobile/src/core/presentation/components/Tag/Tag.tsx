import type { PropsWithChildren, ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { StyleSheet } from "react-native-unistyles";
import tinycolor from "tinycolor2";

import { Text } from "../Text";

export type TagSize = "sm" | "md";
export type TagTone = "subtle" | "outline" | "filled";

type Props = {
  color: string;
  size?: TagSize;
  tone?: TagTone;
  leading?: ReactNode;
} & Pick<ViewProps, "style">;

export const Tag = ({ children, color, size = "sm", tone = "subtle", leading, style }: PropsWithChildren<Props>) => {
  styles.useVariants({ size });

  const bg =
    tone === "filled" ? color : tone === "subtle" ? tinycolor(color).setAlpha(0.14).toRgbString() : "transparent";
  const border = tone === "outline" ? tinycolor(color).setAlpha(0.32).toRgbString() : "transparent";
  const textColor = tone === "filled" ? (tinycolor(color).isDark() ? "#fff" : "#000") : color;

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: border }, style]}>
      {leading}
      <Text style={[styles.text, { color: textColor }]} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    borderWidth: 1,

    variants: {
      size: {
        sm: { paddingHorizontal: 8, paddingVertical: 3, gap: 4 },
        md: { paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
      },
    },
  },

  text: {
    fontFamily: "Satoshi-Medium",
    letterSpacing: 0.2,

    variants: {
      size: {
        sm: { fontSize: 11, lineHeight: 14 },
        md: { fontSize: 13, lineHeight: 16 },
      },
    },
  },
}));
