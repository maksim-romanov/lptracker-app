import { useMemo, useState } from "react";
import { View, type ViewProps } from "react-native";

import { tokensDataUrls } from "core/tokens-data/urls";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./Text";

export type TokenImageSize = "sm" | "md" | "lg";

type Token = { address?: string; symbol?: string };

type TokenImageProps = {
  token: Token;
  /** Used to fetch the logo from the meta endpoint (optional — falls back to monogram). */
  chainId?: number;
  /** Direct image URL — overrides chainId-based lookup. */
  imageUrl?: string;
  size?: TokenImageSize;
} & Pick<ViewProps, "style">;

type TokensImagesProps = {
  tokens: Token[];
  chainId?: number;
  size?: TokenImageSize;
};

const OVERLAP = 0.65;
const DIAMETER: Record<TokenImageSize, number> = { sm: 32, md: 44, lg: 56 };

const hashSeed = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
};

const monogram = (symbol?: string): string => (symbol ? symbol.charAt(0).toUpperCase() : "?");

type FallbackProps = { seed: string; size: TokenImageSize; symbol?: string };

/**
 * Typography-first fallback: a hue-derived dark surface with a lighter
 * monogram of the same hue. Coherent stamp, no patterns competing with the
 * rest of the UI.
 */
const TokenFallback = ({ seed, size, symbol }: FallbackProps) => {
  const palette = useMemo(() => {
    const hue = Math.abs(hashSeed(seed)) % 360;
    return {
      surface: `hsl(${hue}, 26%, 22%)`,
      ink: `hsl(${hue}, 70%, 78%)`,
    };
  }, [seed]);

  styles.useVariants({ size });

  return (
    <View style={[styles.fallback, { backgroundColor: palette.surface }]}>
      <Text allowFontScaling={false} numberOfLines={1} style={[styles.monogram, { color: palette.ink }]}>
        {monogram(symbol)}
      </Text>
    </View>
  );
};

export const TokenImage = ({ token, chainId, imageUrl, size = "md", style }: TokenImageProps) => {
  const seed = (token.address || token.symbol || "?").toLowerCase();
  const [errored, setErrored] = useState(false);

  const remoteUrl = imageUrl ?? (chainId && token.address ? tokensDataUrls.logo(chainId, token.address) : undefined);

  styles.useVariants({ size });

  return (
    <View style={[styles.image, style]}>
      {!remoteUrl || errored ? (
        <TokenFallback seed={seed} size={size} symbol={token.symbol} />
      ) : (
        <Image contentFit="contain" style={styles.imageLayer} source={{ uri: remoteUrl }} onError={() => setErrored(true)} />
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
          key={token.address ?? token.symbol ?? index}
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
        sm: { width: 32, height: 32, borderRadius: 16, borderWidth: 2 },
        md: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5 },
        lg: { width: 56, height: 56, borderRadius: 28, borderWidth: 3 },
      },
    },
  },

  imageLayer: { ...StyleSheet.absoluteFillObject },

  fallback: {
    ...StyleSheet.absoluteFillObject,
  },

  // Classic absolute + transform centering: top sits at 50% of the parent, then
  // the Text is shifted up by half its own line height. This places the Text's
  // geometric middle on the circle's center regardless of font ascent/descent.
  monogram: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: "Satoshi-Bold",
    letterSpacing: -0.5,
    includeFontPadding: false,

    variants: {
      size: {
        sm: { fontSize: 15, lineHeight: 15 * 1.1, transform: [{ translateY: -15 / 2 }] },
        md: { fontSize: 21, lineHeight: 21 * 1.1, transform: [{ translateY: -21 / 2 }] },
        lg: { fontSize: 27, lineHeight: 27 * 1.1, transform: [{ translateY: -27 / 2 }] },
      },
    },
  },

  stacked: (marginLeft: number, zIndex: number) => ({
    marginLeft,
    zIndex,
  }),
}));
