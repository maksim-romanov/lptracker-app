import React from "react";
import type { StyleProp, TextStyle } from "react-native";

import type { IconProps } from "@expo/vector-icons/build/createIconSet";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useUnistyles } from "react-native-unistyles";

const SIZE_MAP = {
  xs: 18,
  sm: 24,
  md: 32,
  lg: 56,
  xl: 64,
} as const;

type TProps = {
  name: "water-outline" | "wallet-outline" | "add-outline" | "trash-outline";
  size?: keyof typeof SIZE_MAP;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export const Icon = React.forwardRef<React.Component<IconProps<TProps["name"]>>, TProps>(({ name, size = "md", color, style }, ref) => {
  const { theme } = useUnistyles();

  return <Ionicons ref={ref} name={name} size={SIZE_MAP[size]} color={color ?? theme.onSurfaceVariant} style={style} />;
});
