import { ScrollView, View } from "react-native";

import { Box, Stack } from "@grapp/stacks";
import { container } from "core/di/container";
import { Button, Card, Icon, type IconName, Tag, Text } from "core/presentation/components";
import { useRouter } from "expo-router";
import { EMembership, UNLIMITED } from "membership/domain/entities/membership.entity";
import { MembershipStore } from "membership/presentation/membership.store";
import { observer } from "mobx-react-lite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles, withUnistyles } from "react-native-unistyles";

const SparkleIcon = withUnistyles(Icon, (theme) => ({ color: theme.warning }));

const PLAN_LABEL: Record<EMembership, string> = {
  [EMembership.FREE]: "Free",
  [EMembership.PRO]: "Pro",
  [EMembership.ADMIN]: "Admin",
};

type Benefit = { icon: IconName; title: string; description: string };

const BENEFITS: Benefit[] = [
  { icon: "wallet-outline", title: "More wallets", description: "Track up to 4 — and beyond." },
  { icon: "notifications-outline", title: "Position alerts", description: "Get notified on big moves." },
  { icon: "stats-chart-outline", title: "Advanced analytics", description: "Historical PnL and insights." },
  { icon: "sparkles-outline", title: "Early access", description: "New features before everyone else." },
];

export const UpgradeScreen = observer(() => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const membership = container.resolve(MembershipStore);
  const planName = PLAN_LABEL[membership.current.id];
  const maxWallets = membership.current.limits.maxWallets;
  const planSubtitle = maxWallets === UNLIMITED ? "Unlimited wallets" : `Up to ${maxWallets} wallet${maxWallets === 1 ? "" : "s"}`;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Stack space={6}>
          <View style={styles.hero}>
            <View style={[styles.heroBubble, { shadowColor: theme.warning }]}>
              <SparkleIcon name="sparkles" size="xl" />
            </View>
            <Stack space={2}>
              <Text variant="title" weight="black" center>
                Premium
              </Text>
              <Text variant="bodySmall" color="muted" center>
                Bigger limits and smarter tools — coming soon.
              </Text>
            </Stack>
          </View>

          <Stack space={2}>
            <SectionLabel>Your plan</SectionLabel>
            <Card variant="outlined" padding="md">
              <Box direction="row" alignY="center" gap={3}>
                <View style={styles.planBubble}>
                  <Icon name="person-outline" size="md" color={theme.onSurfaceVariant} />
                </View>
                <Box flex="fluid">
                  <Text variant="body" weight="bold">
                    {planName}
                  </Text>
                  <Text variant="bodySmall" color="muted">
                    {planSubtitle}
                  </Text>
                </Box>
                <Tag tone="neutral">CURRENT</Tag>
              </Box>
            </Card>
          </Stack>

          <Stack space={2}>
            <SectionLabel>What you'll unlock</SectionLabel>
            <Card variant="outlined" padding="none">
              {BENEFITS.map((benefit, index) => (
                <View key={benefit.title}>
                  {index > 0 && <View style={styles.divider} />}
                  <View style={styles.benefitRow}>
                    <View style={styles.benefitBubble}>
                      <Icon name={benefit.icon} size="sm" color={theme.primary} />
                    </View>
                    <Box flex="fluid">
                      <Text variant="body" weight="bold">
                        {benefit.title}
                      </Text>
                      <Text variant="bodySmall" color="muted">
                        {benefit.description}
                      </Text>
                    </Box>
                  </View>
                </View>
              ))}
            </Card>
          </Stack>
        </Stack>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button title="Got it" variant="inverse" size="lg" onPress={() => router.back()} />
      </View>
    </View>
  );
});

const SectionLabel = ({ children }: { children: string }) => (
  <Text variant="label" weight="bold" color="muted" uppercase>
    {children}
  </Text>
);

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },

  hero: {
    alignItems: "center",
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },

  heroBubble: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.warning}1F`,
    borderWidth: 1,
    borderColor: `${theme.warning}66`,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 22,
    elevation: 8,
  },

  planBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surfaceContainer,
  },

  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },

  benefitBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.primary}1F`,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.outline,
    marginHorizontal: theme.spacing.lg,
  },

  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
}));
