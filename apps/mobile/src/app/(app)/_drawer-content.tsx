import { ScrollView, View } from "react-native";

import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Divider, type IconName, SidebarItem, Text, type TickerToken, TrendingTokensMarquee } from "core/presentation/components";
import { type Href, useRouter, useSegments } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

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

const TRENDING_TOKENS: TickerToken[] = [
  { symbol: "WETH", change: 2.4, chainId: 1, address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
  { symbol: "USDC", change: 0.0, chainId: 1, address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
  { symbol: "WBTC", change: -1.2, chainId: 1, address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
  { symbol: "ARB", change: 5.8, chainId: 42161, address: "0x912CE59144191C1204E64559FE8253a0e49E6548" },
  { symbol: "UNI", change: -2.3, chainId: 1, address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" },
  { symbol: "LINK", change: 1.7, chainId: 1, address: "0x514910771AF9Ca656af840dff83E8264EcF986CA" },
  { symbol: "AAVE", change: 4.2, chainId: 1, address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9" },
  { symbol: "PEPE", change: 12.5, chainId: 1, address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933" },
];

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

export const DrawerContent = function ({ navigation }: DrawerContentComponentProps) {
  const { theme } = useUnistyles();
  const router = useRouter();
  const segments = useSegments();

  const relativeSegments = segments.filter((segment) => !segment.startsWith("("));

  const navigate = (href: Href) => {
    router.navigate(href);
    navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.surface }]} edges={["top", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Brand */}
        <View style={styles.brand}>
          <View style={[styles.brandMark, { backgroundColor: theme.primary }]}>
            <View style={[styles.brandMarkVoid, { backgroundColor: theme.surface }]} />
          </View>
          <View style={styles.brandText}>
            <Text style={styles.wordmark}>void</Text>
            <Text variant="label" color="muted" uppercase style={styles.tagline}>
              defi insights
            </Text>
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
              accent={entry.accent ? theme[entry.accent] : undefined}
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
          accent={WALLETS_NAV.accent ? theme[WALLETS_NAV.accent] : undefined}
          glow={WALLETS_NAV.glow}
          onPress={() => navigate(WALLETS_NAV.href)}
        />

        <View style={styles.ticker}>
          <Text variant="label" color="muted" uppercase style={styles.tickerHeading}>
            Trending
          </Text>
          <TrendingTokensMarquee tokens={TRENDING_TOKENS} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1 },

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
    width: 26,
    height: 26,
    borderRadius: 6,
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    justifyContent: "center",
  },

  brandMarkVoid: {
    width: 9,
    height: 9,
    borderRadius: 2,
  },

  brandText: {
    flex: 1,
  },

  wordmark: {
    fontFamily: "Satoshi-Black",
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -1,
    color: theme.onSurface,
  },

  tagline: {
    marginTop: 2,
    letterSpacing: 1.4,
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

  ticker: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },

  tickerHeading: {
    paddingHorizontal: theme.spacing.xl,
    letterSpacing: 1.2,
  },

  footer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    gap: 2,
  },
}));
