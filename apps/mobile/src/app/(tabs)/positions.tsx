import { View } from "react-native";

import { PositionsScreen } from "positions/presentation/screens/positions.screen";
import { StyleSheet } from "react-native-unistyles";

export default function () {
  return (
    <View collapsable={false} style={styles.container}>
      <PositionsScreen />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
}));
