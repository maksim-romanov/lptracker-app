import type { ComponentProps } from "react";

import { SymbolView } from "expo-symbols";
import { useUnistyles } from "react-native-unistyles";

type SymbolViewProps = ComponentProps<typeof SymbolView>;

export type SymbolColor =
  | "primary"
  | "onSurface"
  | "onSurfaceVariant"
  | "muted"
  | "success"
  | "error"
  | "warning"
  | "inverse";

export type SymbolSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<SymbolSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export type Props = {
  /** SF Symbol name. iOS uses the full SF Symbols library; Android falls back to closest match. */
  name: SymbolViewProps["name"];
  /** Semantic color from the theme */
  color?: SymbolColor;
  /** Semantic size step (xs–xl) or a raw pt size */
  size?: SymbolSize | number;
  /** SF Symbol weight */
  weight?: SymbolViewProps["weight"];
  /** SF Symbol rendering style */
  type?: SymbolViewProps["type"];
  /** Override the resolved tint */
  tintColor?: string;
};

export const Symbol = ({ name, color = "onSurface", size = "md", weight = "regular", type = "monochrome", tintColor }: Props) => {
  const { theme } = useUnistyles();
  const px = typeof size === "number" ? size : SIZE_MAP[size];

  const resolvedTint =
    tintColor ??
    (color === "primary"
      ? theme.primary
      : color === "muted" || color === "onSurfaceVariant"
        ? theme.onSurfaceVariant
        : color === "success"
          ? theme.success
          : color === "error"
            ? theme.error
            : color === "warning"
              ? theme.warning
              : color === "inverse"
                ? theme.inverseOnSurface
                : theme.onSurface);

  return (
    <SymbolView
      name={name}
      size={px}
      weight={weight}
      type={type}
      tintColor={resolvedTint}
      style={{ width: px, height: px }}
    />
  );
};
