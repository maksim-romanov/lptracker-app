import { useEffect, useMemo } from "react";

import { ThemeProvider } from "@react-navigation/native";
import { AppInitUseCase } from "core/application";
import { container } from "core/di/container";
import { createNavigationTheme, type ThemeName } from "core/presentation/theme";
import { QueryProvider } from "core/query/presentation/QueryProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.surface }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardProvider>
        <QueryProvider>
          <ThemeProvider value={navigationTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.surface },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
              <Stack.Screen name="(app)" />
            </Stack>
          </ThemeProvider>
        </QueryProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
