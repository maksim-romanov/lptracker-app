import { DrawerActions } from "@react-navigation/native";
import { Stack, useNavigation } from "expo-router";
import { FavoriteStar } from "positions/presentation/components/FavoriteStar";
import { useUnistyles } from "react-native-unistyles";

export default function PositionsLayout() {
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
      <Stack.Screen name="index" options={{ title: "Positions" }}>
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button icon="line.3.horizontal" onPress={openDrawer} />
        </Stack.Toolbar>
      </Stack.Screen>
      <Stack.Screen name="following" options={{ title: "Following" }}>
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button icon="line.3.horizontal" onPress={openDrawer} />
        </Stack.Toolbar>
      </Stack.Screen>
      <Stack.Screen
        name="[ref]"
        options={({ route }) => {
          const ref = (route.params as { ref?: string })?.ref;
          const positionRef = ref ? decodeURIComponent(ref) : "";
          return {
            title: "Position",
            headerLargeTitle: false,
            headerBackTitle: "Positions",
            headerRight: positionRef ? () => <FavoriteStar positionRef={positionRef} /> : undefined,
          };
        }}
      />
    </Stack>
  );
}
