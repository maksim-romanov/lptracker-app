import { Pressable, View, type ViewStyle } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native-unistyles";

const SIZE = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
} as const;

type Size = keyof typeof SIZE;

type Props = {
  /** Deterministic seed — wallet address or any string. Falls back to a neutral pattern. */
  seed?: string;
  size?: Size;
  onPress?: () => void;
  /** Decorative ring around the avatar (Twitter/X premium feel). */
  ring?: boolean;
  style?: ViewStyle;
};

/**
 * Hash a string into a stable 32-bit integer (FNV-1a flavor).
 * Used as the source of all pattern variation so the same seed → same avatar.
 */
const hashSeed = (input: string) => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash >>> 0;
};

const hueAt = (hash: number, offset: number) => Math.abs((hash >>> (offset * 4)) % 360);

export const IdentityAvatar = ({ seed = "void", size = "md", ring, onPress, style }: Props) => {
  const dim = SIZE[size];
  const h = hashSeed(seed);
  const hueA = hueAt(h, 0);
  const hueB = (hueAt(h, 2) + 90) % 360;
  const hueC = (hueAt(h, 4) + 180) % 360;

  const colorA = `hsl(${hueA}, 85%, 65%)`;
  const colorB = `hsl(${hueB}, 80%, 55%)`;
  const colorC = `hsl(${hueC}, 75%, 45%)`;

  const blob1Top = (h % 40) - 10;
  const blob1Left = ((h >>> 6) % 40) - 10;
  const blob2Top = ((h >>> 10) % 50) + dim * 0.3;
  const blob2Left = ((h >>> 14) % 50) + dim * 0.25;

  const ringPad = ring ? 2 : 0;
  const totalDim = dim + ringPad * 2;

  const content = (
    <View style={[styles.outer(totalDim), ring && styles.ring(totalDim), style]}>
      <View style={[styles.clip(dim)]}>
        <LinearGradient
          colors={[colorA, colorB, colorC] as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View
          style={[
            styles.blob,
            {
              top: blob1Top,
              left: blob1Left,
              width: dim * 0.7,
              height: dim * 0.7,
              backgroundColor: colorC,
              opacity: 0.65,
            },
          ]}
        />
        <View
          style={[
            styles.blob,
            {
              top: blob2Top,
              left: blob2Left,
              width: dim * 0.55,
              height: dim * 0.55,
              backgroundColor: colorA,
              opacity: 0.55,
            },
          ]}
        />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={8}>
        {content}
      </Pressable>
    );
  }
  return content;
};

const styles = StyleSheet.create((theme) => ({
  outer: (dim: number) => ({
    width: dim,
    height: dim,
    borderRadius: dim / 2,
    alignItems: "center",
    justifyContent: "center",
  }),

  ring: (dim: number) => ({
    borderWidth: 2,
    borderColor: theme.primary,
    width: dim,
    height: dim,
    borderRadius: dim / 2,
  }),

  clip: (dim: number) => ({
    width: dim,
    height: dim,
    borderRadius: dim / 2,
    overflow: "hidden",
    backgroundColor: theme.surfaceVariant,
  }),

  blob: {
    position: "absolute",
    borderRadius: 9999,
  },
}));
