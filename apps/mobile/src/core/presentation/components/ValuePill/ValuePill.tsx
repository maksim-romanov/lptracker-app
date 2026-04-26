import { View, type ViewProps } from "react-native";

import { directionOf, type PnLDirection } from "@mars-909/theme";
import numbro from "numbro";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Text } from "../Text";

export type ValuePillSize = "sm" | "md" | "lg";

export type Props = {
  /** Caption above the value (e.g. "Liquidity", "Unclaimed fees") */
  label?: string;
  /** Numeric value in USD — formatted as currency */
  value: number | undefined | null;
  /** Optional delta as a fraction (e.g. 0.024 for +2.4%). Color + glyph follow sign. */
  delta?: number | null;
  /** Force a P&L direction (overrides the sign derived from delta) */
  direction?: PnLDirection;
  /** Placeholder if value is null/undefined. Defaults to em-dash. */
  emptyPlaceholder?: string;
  /** Visual size step */
  size?: ValuePillSize;
  /** Abbreviated form (e.g. $1.4K instead of $1,432.18) */
  abbreviated?: boolean;
} & Pick<ViewProps, "style">;

const formatValue = (value: number | null | undefined, abbreviated: boolean, fallback: string) => {
  if (value == null) return fallback;
  return numbro(value).formatCurrency({ average: abbreviated, mantissa: 2 });
};

export const ValuePill = ({
  label,
  value,
  delta,
  direction,
  emptyPlaceholder = "—",
  size = "md",
  abbreviated = false,
  style,
}: Props) => {
  const { theme } = useUnistyles();
  const dir: PnLDirection = direction ?? (delta != null ? directionOf(delta) : "flat");

  styles.useVariants({ size });

  const deltaColor = dir === "gain" ? theme.success : dir === "loss" ? theme.error : theme.onSurfaceVariant;
  const glyph = dir === "gain" ? theme.pnl.glyph.gain : dir === "loss" ? theme.pnl.glyph.loss : theme.pnl.glyph.flat;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text variant="label" color="muted" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <Text style={styles.value} numberOfLines={1} selectable>
        {formatValue(value, abbreviated, emptyPlaceholder)}
      </Text>
      {delta != null ? (
        <Text variant="bodySmall" style={[styles.delta, { color: deltaColor }]}>
          {glyph} {Math.abs(delta * 100).toFixed(2)}%
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "column",
    variants: {
      size: {
        sm: { gap: 0 },
        md: { gap: theme.spacing.xxs },
        lg: { gap: theme.spacing.xs },
      },
    },
  },

  label: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  value: {
    fontFamily: theme.typography.headline.fontFamily,
    fontWeight: theme.typography.headline.fontWeight,
    color: theme.onSurface,
    fontVariant: ["tabular-nums"],

    variants: {
      size: {
        sm: { fontSize: theme.typography.body.fontSize, lineHeight: theme.typography.body.lineHeight },
        md: { fontSize: theme.typography.headline.fontSize, lineHeight: theme.typography.headline.lineHeight },
        lg: { fontSize: theme.typography.display.fontSize, lineHeight: theme.typography.display.lineHeight },
      },
    },
  },

  delta: {
    fontVariant: ["tabular-nums"],
  },
}));
