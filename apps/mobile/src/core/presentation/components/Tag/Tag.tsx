import type React from "react";
import { View, type ViewProps } from "react-native";

import { StyleSheet } from "react-native-unistyles";
import tinycolor from "tinycolor2";

import { Text } from "../Text";

type TProps = {
  color: string;
  glow?: boolean;
} & Pick<ViewProps, "style">;

export const Tag = ({ children, color, glow, style }: React.PropsWithChildren<TProps>) => {
  const surface = tinycolor(color).setAlpha(0.2).toRgbString();
  const outline = tinycolor(color).setAlpha(0.1).toRgbString();

  return (
    <View style={[styles.container, { backgroundColor: surface, borderColor: outline }, glow && styles.shadow(outline), style]}>
      <Text variant="label" style={[styles.text, { color }]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
  },

  text: {
    textTransform: "capitalize",
  },

  shadow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
  }),
}));
