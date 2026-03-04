import { useEffect, useMemo } from "react";

import { ThemeProvider } from "@react-navigation/native";
import { AppInitUseCase } from "core/application";
import { container } from "core/di/container";
import { createNavigationTheme, type ThemeName } from "core/presentation/theme";
import { QueryProvider } from "core/query/presentation/QueryProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardProvider>
        <QueryProvider>
          <ThemeProvider value={navigationTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                headerShadowVisible: false,
                contentStyle: { backgroundColor: theme.surface },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(tabs)" options={{ title: "" }} />

              <Stack.Screen
                name="wallets/new"
                options={{
                  headerShown: true,
                  headerBackTitle: "",
                  title: "New Wallet",
                }}
              />
              <Stack.Screen
                name="wallets/[walletId]"
                options={{
                  headerShown: true,
                  headerBackTitle: "",
                  title: "Edit Wallet",
                }}
              />
            </Stack>
          </ThemeProvider>
        </QueryProvider>
      </KeyboardProvider>
    </>
  );
}
