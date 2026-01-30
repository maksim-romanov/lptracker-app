import { View } from "react-native";

import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";

type TProps = {
  chainId: number | string;
  tokens: { address: string; symbol?: string }[];
};

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const TokensImages = function TokensImages({ tokens, chainId }: TProps) {
  return (
    <View style={[styles.container, styles.containerTransformed(tokens.length)]}>
      {tokens.map((token, index) => (
        <Image
          key={token.address}
          contentFit="contain"
          style={[styles.image, styles.imageTransformed(index)]}
          source={{ uri: `${BASE_URL}/meta/v1/chains/${chainId}/tokens/${token.address}/logo.png` }}
        />
      ))}
    </View>
  );
};

const IMAGE_SIZE = 60;

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  containerTransformed: (count: number) => ({
    width: count * IMAGE_SIZE - (count - 1) * (IMAGE_SIZE / 2),
  }),

  image: {
    aspectRatio: 1,
    width: IMAGE_SIZE,
    borderWidth: 4,
    borderColor: theme.surfaceContainer,
    backgroundColor: theme.surfaceVariant,
    borderRadius: 100,
  },

  imageTransformed: (index: number) => ({
    borderWidth: index === 0 ? 0 : 4,
    transform: [{ translateX: index * -(IMAGE_SIZE / 2) }],
  }),
}));
