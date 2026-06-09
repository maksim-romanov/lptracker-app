import { useMemo } from "react";
import { Pressable, View, type ViewStyle } from "react-native";

import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
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
  /** Decorative ring around the avatar. */
  ring?: boolean;
  style?: ViewStyle;
};

const VIEWBOX = 100;
const BLOB_COUNT = 4;

const hashSeed = (input: string) => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash >>> 0;
};

const at = (hash: number, shift: number, mod: number) => Math.abs((hash >>> shift) % mod);

type Blob = { id: string; hue: number; cx: number; cy: number; r: number; lightness: number };
type Mesh = { id: string; baseHue: number; baseLightness: number; blobs: Blob[] };

// Hue range: pink (340) ← magenta ← purple ← indigo ← blue → cyan (200).
// Anchored to the brand pink (#FF007A ≈ 332°) and spans the cool/magenta half.
const HUE_MIN = 200;
const HUE_SPAN = 140;
const hueAt = (hash: number, shift: number) => HUE_MIN + at(hash, shift, HUE_SPAN);

const buildMesh = (seed: string): Mesh => {
  const h = hashSeed(seed);
  const id = h.toString(36);
  const baseHue = hueAt(h, 0);

  const blobs: Blob[] = Array.from({ length: BLOB_COUNT }, (_, i) => ({
    id: `${id}_${i}`,
    hue: hueAt(h, 3 + i * 4),
    cx: 15 + at(h, 4 + i * 5, 70),
    cy: 15 + at(h, 7 + i * 5, 70),
    r: 45 + at(h, 11 + i * 4, 35),
    lightness: 55 + at(h, 14 + i * 4, 20),
  }));

  return { id, baseHue, baseLightness: 35 + at(h, 17, 12), blobs };
};

export const IdentityAvatar = ({ seed = "depthly", size = "md", ring, onPress, style }: Props) => {
  const dim = SIZE[size];
  const mesh = useMemo(() => buildMesh(seed), [seed]);

  const ringPad = ring ? 2 : 0;
  const totalDim = dim + ringPad * 2;

  const content = (
    <View style={[styles.outer(totalDim), ring && styles.ring(totalDim), style]}>
      <View style={styles.clip(dim)}>
        <Svg width={dim} height={dim} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
          <Defs>
            {mesh.blobs.map((blob) => (
              <RadialGradient key={blob.id} id={blob.id} cx={blob.cx} cy={blob.cy} r={blob.r} gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={`hsl(${blob.hue}, 95%, ${blob.lightness}%)`} stopOpacity={1} />
                <Stop offset="1" stopColor={`hsl(${blob.hue}, 95%, ${blob.lightness}%)`} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          <Rect x="0" y="0" width={VIEWBOX} height={VIEWBOX} fill={`hsl(${mesh.baseHue}, 80%, ${mesh.baseLightness}%)`} />
          {mesh.blobs.map((blob) => (
            <Rect key={blob.id} x="0" y="0" width={VIEWBOX} height={VIEWBOX} fill={`url(#${blob.id})`} />
          ))}
        </Svg>
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
}));
