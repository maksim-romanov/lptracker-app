import { View, type ViewStyle } from "react-native";

import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

type Tint = "primary" | "warning" | "success" | "error";

type Props = {
  icon?: IconName;
  title: string;
  description?: string;
  tint?: Tint;
  actionLabel?: string;
  actionIcon?: IconName;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
};

const ThemedIcon = withUnistyles(Icon);

export const EmptyState = ({
  icon,
  title,
  description,
  tint = "primary",
  actionLabel,
  actionIcon,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
}: Props) => {
  styles.useVariants({ tint });

  return (
    <View style={[styles.stack, style]}>
      {icon ? (
        <View style={styles.iconBubble}>
          <ThemedIcon name={icon} size="2xl" uniProps={(theme) => ({ color: theme[tint] })} />
        </View>
      ) : null}
      <Text variant="title" weight="bold" center>
        {title}
      </Text>
      {description ? (
        <Text variant="bodySmall" color="muted" center>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} icon={actionIcon} iconPosition="leading" onPress={onAction} variant="primary" size="md" style={styles.cta} />
      ) : null}
      {secondaryActionLabel && onSecondaryAction ? (
        <Button title={secondaryActionLabel} onPress={onSecondaryAction} variant="ghost" size="md" style={styles.secondaryCta} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  stack: {
    alignItems: "center",
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing["3xl"],
  },

  iconBubble: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: theme.spacing.xs,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,

    variants: {
      tint: {
        primary: {
          backgroundColor: `${theme.primary}1F`,
          borderColor: `${theme.primary}66`,
          shadowColor: theme.primary,
        },
        warning: {
          backgroundColor: `${theme.warning}1F`,
          borderColor: `${theme.warning}66`,
          shadowColor: theme.warning,
        },
        success: {
          backgroundColor: `${theme.success}1F`,
          borderColor: `${theme.success}66`,
          shadowColor: theme.success,
        },
        error: {
          backgroundColor: `${theme.error}1F`,
          borderColor: `${theme.error}66`,
          shadowColor: theme.error,
        },
      },
    },
  },

  cta: {
    marginTop: theme.spacing.md,
    minWidth: 200,
  },

  secondaryCta: {
    marginTop: -theme.spacing.xs,
  },
}));
