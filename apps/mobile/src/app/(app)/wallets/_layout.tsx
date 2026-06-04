import { DrawerActions } from "@react-navigation/native";
import { Stack, useNavigation } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

export default function WalletsLayout() {
  const { theme } = useUnistyles();
  const navigation = useNavigation();
  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        contentStyle: { backgroundColor: theme.surface },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Wallets" }}>
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button icon="line.3.horizontal" onPress={openDrawer} />
        </Stack.Toolbar>
      </Stack.Screen>
      <Stack.Screen
        name="new"
        options={{
          title: "Add wallet",
          headerLargeTitle: false,
          headerBackTitle: "Wallets",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Edit wallet",
          headerLargeTitle: false,
          headerBackTitle: "Wallets",
        }}
      />
      <Stack.Screen
        name="networks"
        options={{
          title: "Networks",
          headerLargeTitle: false,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="upgrade"
        options={{
          title: "Premium",
          presentation: "formSheet",
          headerLargeTitle: false,
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
          contentStyle: { backgroundColor: theme.surface },
        }}
      />
    </Stack>
  );
}
