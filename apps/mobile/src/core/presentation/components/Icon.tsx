import React from "react";
import type { StyleProp, TextStyle } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useUnistyles } from "react-native-unistyles";

const SIZE = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
  "2xl": 48,
} as const;

export type IconName =
  | "home-outline"
  | "home"
  | "stats-chart-outline"
  | "stats-chart"
  | "star-outline"
  | "star"
  | "wallet-outline"
  | "wallet"
  | "notifications-outline"
  | "notifications"
  | "person-outline"
  | "person"
  | "settings-outline"
  | "settings"
  | "menu-outline"
  | "close-outline"
  | "add-outline"
  | "add"
  | "add-circle-outline"
  | "add-circle"
  | "trash-outline"
  | "search-outline"
  | "ellipsis-horizontal"
  | "chevron-forward-outline"
  | "chevron-back-outline"
  | "moon-outline"
  | "sunny-outline"
  | "checkmark-outline"
  | "open-outline"
  | "swap-horizontal-outline"
  | "trending-up-outline"
  | "trending-down-outline"
  | "water-outline"
  | "people-outline"
  | "apps-outline"
  | "sparkles-outline"
  | "sparkles"
  | "lock-closed-outline"
  | "lock-closed"
  | "time-outline"
  | "information-circle-outline";

export type IconSize = keyof typeof SIZE;

type Props = {
  name: IconName;
  size?: IconSize;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export const Icon = React.forwardRef<React.ComponentRef<typeof Ionicons>, Props>(({ name, size = "md", color, style }, ref) => {
  const { theme } = useUnistyles();

  return <Ionicons ref={ref} name={name} size={SIZE[size]} color={color ?? theme.onSurface} style={style} />;
});
