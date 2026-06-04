import { Dimensions } from "react-native";

import { container } from "core/di/container";
import { type Href, Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { observer } from "mobx-react-lite";
import { useUnistyles } from "react-native-unistyles";
import { WalletsStore } from "wallets/presentation/wallets.store";

import { DrawerContent } from "./_drawer-content";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = Math.round(SCREEN_WIDTH * 0.78);

const AppDrawerLayout = observer(() => {
  const { theme } = useUnistyles();
  const store = container.resolve(WalletsStore);

  if (store.isEmpty) {
    return <Redirect href={"/onboarding" as Href} />;
  }

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
});

export default AppDrawerLayout;
