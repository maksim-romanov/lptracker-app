import { Pressable, ScrollView, Text, View } from "react-native";

import type { ThemeName } from "core/presentation/theme";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, UnistylesRuntime, useUnistyles } from "react-native-unistyles";

const themeOptions: { name: ThemeName; label: string; emoji: string }[] = [
  { name: "neonLight", label: "Light", emoji: "☀️" },
  { name: "neonDark", label: "Dark", emoji: "🌙" },
];

export function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const themeName = (UnistylesRuntime.themeName ?? "neonDark") as ThemeName;

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
          <Text style={[styles.title, theme.typography.display, { color: theme.primary, marginBottom: theme.spacing.md }]}>MatrApp</Text>
          <Text style={[styles.subtitle, theme.typography.bodyLarge, { color: theme.onSurfaceVariant }]}>
            Track your DeFi positions across protocols
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, theme.typography.headline, { color: theme.onBackground, marginBottom: theme.spacing.xl }]}>
            Choose appearance
          </Text>

          <View style={[styles.themeGrid, { gap: theme.spacing.lg }]}>
            {themeOptions.map((option) => (
              <Pressable
                key={option.name}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: themeName === option.name ? theme.primaryContainer : theme.surfaceVariant,
                    borderRadius: theme.radius.xl,
                    padding: theme.spacing.xl,
                    borderColor: themeName === option.name ? theme.primary : "transparent",
                  },
                ]}
                onPress={() => handleThemeSelect(option.name)}
              >
                <Text style={[styles.themeEmoji, { marginBottom: theme.spacing.md }]}>{option.emoji}</Text>
                <Text
                  style={[
                    theme.typography.label,
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
          <Text style={[theme.typography.label, { color: theme.onPrimary, fontWeight: "600" }]}>Get Started</Text>
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
  sectionTitle: {
    textAlign: "center",
  },
  themeGrid: {
    flexDirection: "row",
    justifyContent: "center",
  },
  themeCard: {
    flex: 1,
    alignItems: "center",
    borderWidth: 2,
  },
  themeEmoji: {
    fontSize: 48,
  },
  continueButton: {
    alignItems: "center",
  },
});
