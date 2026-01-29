import { View } from "react-native";

import { StyleSheet } from "react-native-unistyles";
import { WalletsScreen } from "wallets/presentation/screens/wallets.screen";

export default function () {
  return (
    <View collapsable={false} style={styles.container}>
      <WalletsScreen />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
}));
