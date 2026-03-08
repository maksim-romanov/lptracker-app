import { View } from "react-native";

import { FollowingScreen } from "positions/presentation/screens/FollowingScreen";
import { StyleSheet } from "react-native-unistyles";

export default function () {
  return (
    <View collapsable={false} style={styles.container}>
      <FollowingScreen />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
}));
