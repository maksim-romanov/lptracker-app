import { useMemo, useState } from "react";
import { View, type ViewProps } from "react-native";

import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";

export type TokenImageSize = "sm" | "md";

type Token = { address: string; symbol?: string };

type TokenImageProps = {
  token: Token;
  chainId: number | string;
  size?: TokenImageSize;
} & Pick<ViewProps, "style">;

type TokensImagesProps = {
  tokens: Token[];
  chainId: number | string;
  size?: TokenImageSize;
};

const OVERLAP = 0.65;

const DIAMETER: Record<TokenImageSize, number> = { sm: 48, md: 64 };

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

const hashSeed = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
};

const monogram = (symbol?: string): string => (symbol ? symbol.charAt(0).toUpperCase() : "?");

/**
 * Typography-first fallback. Solid muted-hue surface + bold monogram in a
 * lighter variant of the same hue. Both colors share a hue derived from the
 * token address, so each token reads as a coherent "stamp" — no patterns, no
 * gradients, no blobs that fight the rest of the design system.
 */
type TokenFallbackProps = {
  seed: string;
  size: TokenImageSize;
  symbol?: string;
};

const TokenFallback = ({ seed, size, symbol }: TokenFallbackProps) => {
  const palette = useMemo(() => {
    const hue = Math.abs(hashSeed(seed)) % 360;
    return {
      surface: `hsl(${hue}, 28%, 20%)`,
      ink: `hsl(${hue}, 68%, 76%)`,
    };
  }, [seed]);

  styles.useVariants({ size });

  return (
    <View style={[styles.fallback, styles.fallbackSurface(palette.surface)]}>
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={[styles.monogram, styles.monogramInk(palette.ink)]}
      >
        {monogram(symbol)}
      </Text>
    </View>
  );
};

export const TokenImage = ({ token, chainId, size = "md", style }: TokenImageProps) => {
  const seed = (token.address || token.symbol || "").toLowerCase();
  const [errored, setErrored] = useState(false);

  styles.useVariants({ size });

  return (
    <View style={[styles.image, style]}>
      {errored ? (
        <TokenFallback seed={seed} size={size} symbol={token.symbol} />
      ) : (
        <Image
          contentFit="contain"
          style={styles.imageLayer}
          source={{ uri: `${BASE_URL}/meta/v1/chains/${chainId}/tokens/${token.address}/logo.png` }}
          onError={() => setErrored(true)}
        />
      )}
    </View>
  );
};

export const TokensImages = ({ tokens, chainId, size = "md" }: TokensImagesProps) => {
  const overlapPx = DIAMETER[size] * OVERLAP;
  const last = tokens.length - 1;

  return (
    <View style={styles.container}>
      {tokens.map((token, index) => (
        <TokenImage
          key={token.address}
          token={token}
          chainId={chainId}
          size={size}
          style={styles.stacked(index === 0 ? 0 : -overlapPx, last - index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  image: {
    overflow: "hidden",
    borderColor: theme.surface,
    backgroundColor: theme.surfaceVariant,

    variants: {
      size: {
        sm: { width: 48, height: 48, borderRadius: 24, borderWidth: 2.5 },
        md: { width: 64, height: 64, borderRadius: 32, borderWidth: 3 },
      },
    },
  },

  imageLayer: {
    ...StyleSheet.absoluteFillObject,
  },

  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  fallbackSurface: (color: string) => ({
    backgroundColor: color,
  }),

  /**
   * Cap-height visual centering of one uppercase letter in a circle.
   *
   * Within the text bounding box, the cap visual centre sits at ~0.525 ×
   * fontSize from the box top (Satoshi-Bold metrics with `lineHeight = 1.2 ×
   * fontSize`). Adding a top padding equal to (innerSize/2 − fontSize × 0.525)
   * lands the cap centre on the disk centre. Values below are precomputed:
   *
   *   sm: inner 43, fontSize 23 → top = 43/2 − 23×0.525 = 9.43
   *   md: inner 58, fontSize 31 → top = 58/2 − 31×0.525 = 12.73
   */
  monogram: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: "Satoshi-Bold",
    letterSpacing: -0.8,

    variants: {
      size: {
        sm: { fontSize: 23, lineHeight: 27.6, top: 9.43 },
        md: { fontSize: 31, lineHeight: 37.2, top: 12.73 },
      },
    },
  },

  monogramInk: (color: string) => ({
    color,
  }),

  stacked: (marginLeft: number, zIndex: number) => ({
    marginLeft,
    zIndex,
  }),
}));
