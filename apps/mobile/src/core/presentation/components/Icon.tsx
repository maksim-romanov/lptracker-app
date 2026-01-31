import type { StyleProp, TextStyle } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useUnistyles } from "react-native-unistyles";

const SIZE_MAP = {
  sm: 24,
  md: 32,
  lg: 56,
  xl: 64,
} as const;

type TProps = {
  name: "water-outline" | "wallet-outline";
  size?: keyof typeof SIZE_MAP;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function Icon({ name, size = "md", color, style }: TProps) {
  const { theme } = useUnistyles();

  if (name === "water-outline") {
    return <Ionicons name="water-outline" size={SIZE_MAP[size]} color={color ?? theme.onSurfaceVariant} style={style} />;
  }

  return null;
}
