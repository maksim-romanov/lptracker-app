import { ScrollView, View } from "react-native";

import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Divider, type IconName, SidebarItem, Text } from "core/presentation/components";
import { type Href, useRouter, useSegments } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

type TAccentToken = "warning" | "success" | "error";

type TNavEntry = {
  key: string;
  label: string;
  icon: IconName;
  iconActive: IconName;
  href: Href;
  segments: string[];
  accent?: TAccentToken;
  glow?: boolean;
};

const PRIMARY_NAV: TNavEntry[] = [
  {
    key: "positions",
    label: "Positions",
    icon: "stats-chart-outline",
    iconActive: "stats-chart",
    href: "/positions",
    segments: ["positions"],
  },
  {
    key: "following",
    label: "Following",
    icon: "star-outline",
    iconActive: "star",
    href: "/positions/following",
    segments: ["positions", "following"],
    accent: "warning",
    glow: true,
  },
];

const WALLETS_NAV: TNavEntry = {
  key: "wallets",
  label: "Wallets",
  icon: "wallet-outline",
  iconActive: "wallet",
  href: "/wallets",
  segments: ["wallets"],
};

const arraysEqual = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((value, index) => value === b[index]);

export const DrawerContent = ({ navigation }: DrawerContentComponentProps) => {
  const router = useRouter();
  const segments = useSegments();

  const relativeSegments = segments.filter((segment) => !segment.startsWith("("));

  const navigate = (href: Href) => {
    router.navigate(href);
    navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.brandMark} />
          <View style={styles.wordmarkRow}>
            <Text style={styles.wordmark}>depthly</Text>
            <View style={styles.wordmarkDot} />
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.nav}>
          {PRIMARY_NAV.map((entry) => (
            <SidebarItem
              key={entry.key}
              label={entry.label}
              icon={entry.icon}
              iconActive={entry.iconActive}
              active={arraysEqual(entry.segments, relativeSegments)}
              accent={entry.accent}
              glow={entry.glow}
              onPress={() => navigate(entry.href)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <SidebarItem
          label={WALLETS_NAV.label}
          icon={WALLETS_NAV.icon}
          iconActive={WALLETS_NAV.iconActive}
          active={arraysEqual(WALLETS_NAV.segments, relativeSegments)}
          accent={WALLETS_NAV.accent}
          glow={WALLETS_NAV.glow}
          onPress={() => navigate(WALLETS_NAV.href)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.surface,
  },

  scroll: {
    paddingTop: theme.spacing.lg,
    flexGrow: 1,
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },

  brandMark: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: theme.outlineVariant,
  },

  wordmarkRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  wordmark: {
    fontFamily: "Satoshi-Black",
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -1,
    color: theme.onSurface,
  },

  wordmarkDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.primary,
    marginLeft: 3,
    marginBottom: 3,
  },

  divider: {
    marginVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.outlineVariant,
  },

  nav: {
    paddingHorizontal: theme.spacing.md,
    gap: 2,
  },

  footer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    gap: 2,
  },
}));

export default DrawerContent;
