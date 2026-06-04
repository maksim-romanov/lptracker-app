import { StyleSheet as RNStyleSheet, View } from "react-native";

import { PROTOCOL_LOGOS } from "core/config/protocol-logos";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";

const PINK = "#FF007A";
const PATTERN = require("assets/protocols/uniswap-pattern.png");

export const UniswapV3Strip = () => (
  <View style={styles.container}>
    <Image source={PATTERN} style={[RNStyleSheet.absoluteFill, styles.pattern]} contentFit="cover" tintColor={PINK} />

    <Image source={PROTOCOL_LOGOS["uniswap-v3"]} style={styles.watermark} contentFit="contain" tintColor={PINK} pointerEvents="none" />

    <View style={styles.content}>
      <Text style={styles.label}>Uniswap V3</Text>
    </View>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  container: {
    height: 52,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.outline,
    overflow: "hidden",
    backgroundColor: theme.surface,
    justifyContent: "center",
  },

  pattern: {
    transform: [{ scale: 2.5 }],
  },

  content: {
    paddingHorizontal: theme.spacing.lg,
  },

  label: {
    fontFamily: "Satoshi-Bold",
    fontSize: 15,
    color: PINK,
    letterSpacing: -0.1,
  },

  watermark: {
    position: "absolute",
    transform: [{ translateX: 0 }, { translateY: -65 / 5 }],
    right: 0,
    top: 0,
    aspectRatio: 1,
    height: 65,
  },
}));
