import type { ThemeName } from "core/presentation/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { UnistylesRuntime } from "react-native-unistyles";

export default function RootLayout() {
  const themeName = (UnistylesRuntime.themeName ?? "midnightDark") as ThemeName;
  const isDark = themeName.includes("Dark");

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
