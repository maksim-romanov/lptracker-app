import { PROTOCOL_LOGOS, type Protocol } from "core/config/protocol-logos";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  protocol: Protocol;
  size?: number;
};

export const ProtocolIcon = ({ protocol, size = 20 }: Props) => (
  <Image source={PROTOCOL_LOGOS[protocol]} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} contentFit="contain" />
);

const styles = StyleSheet.create((theme) => ({
  image: {
    backgroundColor: theme.surfaceVariant,
  },
}));
