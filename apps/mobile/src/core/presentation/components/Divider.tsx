import { View, type ViewStyle } from "react-native";

import { StyleSheet } from "react-native-unistyles";

export const Divider = ({ style }: { style?: ViewStyle }) => <View style={[styles.line, style]} />;

const styles = StyleSheet.create((theme) => ({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.outline,
    alignSelf: "stretch",
  },
}));
