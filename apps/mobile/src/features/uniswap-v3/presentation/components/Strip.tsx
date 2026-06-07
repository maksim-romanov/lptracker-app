import { StyleSheet as RNStyleSheet, View } from "react-native";

import { PROTOCOLS_META } from "@mars-909/catalog";
import { Text } from "core/presentation/components";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";

const PATTERN = require("assets/protocols/uniswap-pattern.png");
const LOGO = require("assets/uniswap_uni_logo.png");
const META = PROTOCOLS_META["uniswap-v3"];

export const Strip = function Strip() {
  return (
    <View style={styles.container}>
      <Image source={PATTERN} style={[RNStyleSheet.absoluteFill, styles.pattern]} contentFit="cover" tintColor={META.brandColor} />
      <Image source={LOGO} style={styles.watermark} contentFit="contain" tintColor={META.brandColor} pointerEvents="none" />
      <View style={styles.content}>
        <Text style={styles.label}>{META.label}</Text>
      </View>
    </View>
  );
};

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
    color: META.brandColor,
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
