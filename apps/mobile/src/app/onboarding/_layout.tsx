import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

export default function OnboardingLayout() {
  const { theme } = useUnistyles();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.surface },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="wallet"
        options={{
          headerShown: true,
          title: "Add wallet",
          headerLargeTitle: false,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="networks"
        options={{
          headerShown: true,
          title: "Networks",
          headerLargeTitle: false,
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
