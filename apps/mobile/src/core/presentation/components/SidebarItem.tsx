import { Pressable, View } from "react-native";

import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

type AccentToken = "primary" | "warning" | "success" | "error";

type Props = {
  label: string;
  icon: IconName;
  iconActive?: IconName;
  active?: boolean;
  onPress: () => void;
  /** Optional numeric badge — e.g., unread count. */
  badge?: number;
  /** Active-state accent token. Defaults to "primary". */
  accent?: AccentToken;
  /** Wrap the row in a colored shadow halo when active. */
  glow?: boolean;
};

export const SidebarItem = ({ label, icon, iconActive, active, onPress, badge, accent = "primary", glow }: Props) => {
  const { theme } = useUnistyles();
  const accentColor = theme[accent];
  const tint = active ? accentColor : theme.onSurface;
  const showGlow = !!active && !!glow;

  const row = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        active && { backgroundColor: `${accentColor}14`, borderColor: `${accentColor}40` },
        pressed && !active && styles.pressed,
      ]}
    >
      <Icon name={active && iconActive ? iconActive : icon} size="lg" color={tint} />
      <Text variant="headline" weight={active ? "bold" : "regular"} style={{ color: tint, flex: 1 }}>
        {label}
      </Text>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: accentColor }]}>
          <Text variant="label" weight="bold" style={styles.badgeText}>
            {badge > 99 ? "99+" : badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );

  if (showGlow) {
    return <View style={[styles.glow, { shadowColor: accentColor }]}>{row}</View>;
  }

  return row;
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "transparent",
  },

  pressed: {
    backgroundColor: theme.surfaceContainer,
  },

  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: theme.onPrimary,
    fontSize: 11,
  },

  // iOS-only colored halo around the active row; Android falls back to gray elevation.
  glow: {
    borderRadius: theme.radius.full,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 4,
  },
}));
