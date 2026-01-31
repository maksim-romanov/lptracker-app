import { View } from "react-native";

import { Image } from "expo-image";
import { StyleSheet, type UnistylesVariants } from "react-native-unistyles";

type ComponentProps = UnistylesVariants<typeof styles>;

type TProps = {
  chainId: number | string;
  tokens: { address: string; symbol?: string }[];
} & ComponentProps;

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const TokenImage = ({
  token,
  chainId,
  size,
}: { token: { address: string; symbol?: string }; chainId: number | string } & ComponentProps) => {
  styles.useVariants({ size });

  return (
    <View style={styles.imageContainer}>
      <Image
        contentFit="contain"
        style={styles.image}
        source={{ uri: `${BASE_URL}/meta/v1/chains/${chainId}/tokens/${token.address}/logo.png` }}
      />
    </View>
  );
};

export const TokensImages = ({ tokens, chainId, size }: TProps) => {
  styles.useVariants({ size });

  return (
    <View style={[styles.container, styles.containerTransformed(tokens.length)]}>
      {tokens.map((token, index) => (
        <View key={token.address} style={[styles.imageContainerTransformed(index)]}>
          <TokenImage token={token} chainId={chainId} />
        </View>
      ))}
    </View>
  );
};

const IMAGE_SIZE = {
  md: 55,
  sm: 25,
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  containerTransformed: (count: number) => ({
    width: count * IMAGE_SIZE.md - (count - 1) * (IMAGE_SIZE.md / 2),

    vatiants: {
      size: {
        sm: {
          width: count * IMAGE_SIZE.sm - (count - 1) * (IMAGE_SIZE.sm / 2),
        },
      },
    },
  }),

  image: {
    aspectRatio: 1,
    width: "100%",
  },

  imageContainer: {
    borderWidth: 4,
    width: IMAGE_SIZE.md,
    borderColor: theme.surfaceContainer,
    backgroundColor: theme.surfaceVariant,
    borderRadius: 100,
    overflow: "hidden",

    variants: {
      size: {
        sm: {
          width: IMAGE_SIZE.sm,
          borderWidth: 2,
        },
      },
    },
  },

  imageContainerTransformed: (index: number) => ({
    transform: [{ translateX: index * -(IMAGE_SIZE.md / 2) }],

    variants: {
      size: {
        sm: {
          transform: [{ translateX: index * -(IMAGE_SIZE.sm / 2) }],
        },
      },
    },
  }),
}));
