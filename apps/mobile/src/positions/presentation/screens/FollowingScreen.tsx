import { View } from "react-native";

import { Icon, Placeholder } from "core/presentation/components";
import { StyleSheet } from "react-native-unistyles";

export function FollowingScreen() {
  return (
    <View style={styles.container}>
      <Placeholder
        icon={<Icon name="water-outline" size="xl" />}
        title="Following"
        description="Positions you follow will appear here"
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
  },
}));
