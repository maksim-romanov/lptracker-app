import { View, type ViewStyle } from "react-native";

import { StyleSheet } from "react-native-unistyles";

type Props = {
  width?: ViewStyle["width"];
  height?: ViewStyle["height"];
  radius?: number;
  style?: ViewStyle;
};

export const Skeleton = ({ width = "100%", height = 16, radius = 8, style }: Props) => (
  <View style={[styles.box, { width, height, borderRadius: radius }, style]} />
);

const styles = StyleSheet.create((theme) => ({
  box: {
    backgroundColor: theme.surfaceVariant,
  },
}));
