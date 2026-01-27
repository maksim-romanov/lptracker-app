import { Pressable, ScrollView, Text, View } from "react-native";

import type { ThemeName } from "core/presentation/theme";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, UnistylesRuntime, useUnistyles } from "react-native-unistyles";

const themeOptions: { name: ThemeName; label: string; emoji: string }[] = [
  { name: "oceanLight", label: "Ocean Light", emoji: "🌊" },
  { name: "oceanDark", label: "Ocean Dark", emoji: "🌌" },
  { name: "nebulaLight", label: "Nebula Light", emoji: "💜" },
  { name: "nebulaDark", label: "Nebula Dark", emoji: "🔮" },
  { name: "mintLight", label: "Mint Light", emoji: "🌿" },
  { name: "mintDark", label: "Mint Dark", emoji: "🌲" },
  { name: "sunsetLight", label: "Sunset Light", emoji: "🌅" },
  { name: "sunsetDark", label: "Sunset Dark", emoji: "🌆" },
  { name: "midnightLight", label: "Midnight Light", emoji: "☁️" },
  { name: "midnightDark", label: "Midnight Dark", emoji: "🌙" },
];

export function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const themeName = (UnistylesRuntime.themeName ?? "midnightDark") as ThemeName;

  const handleThemeSelect = (newTheme: ThemeName) => {
    UnistylesRuntime.setTheme(newTheme);
  };

  const handleContinue = () => {
    router.replace("/(tabs)/positions");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { padding: theme.spacing["2xl"] }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { marginTop: theme.spacing["4xl"], marginBottom: theme.spacing["3xl"] }]}>
          <Text style={[styles.title, theme.typography.displaySmall, { color: theme.onBackground, marginBottom: theme.spacing.md }]}>
            Welcome to MatrApp
          </Text>
          <Text style={[styles.subtitle, theme.typography.bodyLarge, { color: theme.onSurfaceVariant }]}>
            Track your DeFi positions across protocols
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, theme.typography.titleLarge, { color: theme.onBackground, marginBottom: theme.spacing.xs }]}>
            Choose your theme
          </Text>
          <Text style={[theme.typography.bodyMedium, { color: theme.onSurfaceVariant, marginBottom: theme.spacing.xl }]}>
            Current: {themeName}
          </Text>

          <View style={[styles.themeGrid, { gap: theme.spacing.md }]}>
            {themeOptions.map((option) => (
              <Pressable
                key={option.name}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: themeName === option.name ? theme.primaryContainer : theme.surfaceVariant,
                    borderRadius: theme.radius.lg,
                    padding: theme.spacing.lg,
                    borderColor: themeName === option.name ? theme.primary : "transparent",
                  },
                ]}
                onPress={() => handleThemeSelect(option.name)}
              >
                <Text style={[styles.themeEmoji, { marginBottom: theme.spacing.sm }]}>{option.emoji}</Text>
                <Text
                  style={[
                    theme.typography.labelMedium,
                    {
                      color: themeName === option.name ? theme.primary : theme.onSurfaceVariant,
                      fontWeight: themeName === option.name ? "600" : "500",
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={[
            styles.continueButton,
            {
              backgroundColor: theme.primary,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.lg,
              marginTop: theme.spacing["2xl"],
            },
          ]}
          onPress={handleContinue}
        >
          <Text style={[theme.typography.labelLarge, { color: theme.onPrimary }]}>Get Started</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  section: {
    flex: 1,
  },
  sectionTitle: {},
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  themeCard: {
    width: "45%",
    alignItems: "center",
    borderWidth: 2,
  },
  themeEmoji: {
    fontSize: 32,
  },
  continueButton: {
    alignItems: "center",
  },
});
