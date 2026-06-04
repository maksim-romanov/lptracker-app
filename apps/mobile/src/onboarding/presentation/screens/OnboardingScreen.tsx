import { View } from "react-native";

import { Button, Text } from "core/presentation/components";
import { LinearGradient } from "expo-linear-gradient";
import { type Href, useRouter } from "expo-router";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

const AmbientGlow = withUnistyles(LinearGradient, (theme) => ({
  colors: [`${theme.primary}33`, `${theme.primary}0A`, "transparent"] as const,
}));

export const OnboardingScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <AmbientGlow locations={[0, 0.45, 1]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.ambient} pointerEvents="none" />

      <SafeAreaView style={styles.introRoot} edges={["top", "bottom"]}>
        <View style={styles.introInner}>
          <View style={styles.hero}>
            <Animated.View entering={FadeInUp.duration(520)} style={styles.brandMark}>
              <View style={styles.brandMarkVoid} />
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(520).delay(120)} style={styles.titleBlock}>
              <Text style={styles.wordmark}>void</Text>
              <Text variant="label" color="muted" uppercase style={styles.tagline}>
                defi insights
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(520).delay(260)}>
              <Text variant="body" color="muted" center style={styles.pitch}>
                Live positions, fees, and ranges{"\n"}across the chains you trade on.
              </Text>
            </Animated.View>
          </View>

          <Animated.View entering={FadeIn.duration(520).delay(420)} style={styles.footer}>
            <Button
              title="Add your first wallet"
              icon="add"
              iconPosition="leading"
              variant="primary"
              size="lg"
              onPress={() => router.push("/onboarding/wallet" as Href)}
            />
            <Text variant="label" color="muted" uppercase center style={styles.disclaimer}>
              Read-only · No keys needed
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.surface,
  },

  ambient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%",
  },

  introRoot: {
    flex: 1,
  },

  introInner: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xl,
  },

  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xl,
  },

  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 14,
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 12,
  },

  brandMarkVoid: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: theme.surface,
  },

  titleBlock: {
    alignItems: "center",
    gap: theme.spacing.xs,
  },

  wordmark: {
    fontFamily: "Satoshi-Black",
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -2,
    color: theme.onSurface,
  },

  tagline: {
    letterSpacing: 2.4,
  },

  pitch: {
    lineHeight: 22,
    maxWidth: 320,
  },

  footer: {
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },

  disclaimer: {
    letterSpacing: 1.6,
  },
}));
