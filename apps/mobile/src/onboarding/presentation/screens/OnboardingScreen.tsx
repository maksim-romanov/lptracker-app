import { View } from "react-native";

import { Button, Text } from "core/presentation/components";
import { LinearGradient } from "expo-linear-gradient";
import { type Href, useRouter } from "expo-router";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

const AMBIENT_COLORS = ["#FF007A33", "#FF007A0A", "transparent"] as const;

export const OnboardingScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={AMBIENT_COLORS}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.ambient}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.introRoot} edges={["top", "bottom"]}>
        <View style={styles.introInner}>
          <View style={styles.hero}>
            <Animated.View entering={FadeInUp.duration(520)} style={styles.brandMark} />

            <Animated.View entering={FadeInUp.duration(520).delay(120)} style={styles.titleBlock}>
              <View style={styles.wordmarkRow}>
                <Text style={styles.wordmark}>depthly</Text>
                <View style={styles.wordmarkDot} />
              </View>
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
    borderRadius: 16,
    backgroundColor: theme.outlineVariant,
  },

  titleBlock: {
    alignItems: "center",
    gap: theme.spacing.xs,
  },

  wordmarkRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  wordmark: {
    fontFamily: "Satoshi-Black",
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -2,
    color: theme.onSurface,
  },

  wordmarkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF007A",
    marginLeft: 5,
    marginBottom: 6,
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
