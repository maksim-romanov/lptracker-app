import { useEffect, useMemo } from "react";

import { ThemeProvider } from "@react-navigation/native";
import { AppInitUseCase } from "core/application";
import { container } from "core/di/container";
import { createNavigationTheme, type ThemeName } from "core/presentation/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";

export default function RootLayout() {
  const themeName = (UnistylesRuntime.themeName ?? "neonDark") as ThemeName;
  const isDark = themeName.includes("Dark");
  const { theme } = useUnistyles();

  const navigationTheme = useMemo(() => createNavigationTheme(theme, isDark), [theme, isDark]);

  useEffect(() => {
    container.resolve(AppInitUseCase).execute();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </>
  );
}
