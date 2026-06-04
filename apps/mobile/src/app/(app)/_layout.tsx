import { Dimensions } from "react-native";

import { Drawer } from "expo-router/drawer";
import { useUnistyles } from "react-native-unistyles";

import { DrawerContent } from "./_drawer-content";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = Math.round(SCREEN_WIDTH * 0.78);

export default function AppDrawerLayout() {
  const { theme } = useUnistyles();

  return (
    <Drawer
      drawerContent={DrawerContent}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.surface,
          width: DRAWER_WIDTH,
          borderRightWidth: 0,
        },
        drawerType: "front",
        sceneStyle: { backgroundColor: theme.surface },
        swipeEdgeWidth: 80,
      }}
    >
      <Drawer.Screen name="positions" options={{ title: "Positions" }} />
      <Drawer.Screen name="wallets" options={{ title: "Wallets" }} />
    </Drawer>
  );
}
