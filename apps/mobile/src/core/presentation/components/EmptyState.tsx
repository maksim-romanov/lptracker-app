import { View, type ViewStyle } from "react-native";

import { StyleSheet } from "react-native-unistyles";

import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

type Props = {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

export const EmptyState = ({ icon, title, description, actionLabel, onAction, style }: Props) => (
  <View style={[styles.container, style]}>
    {icon && (
      <View style={styles.iconBubble}>
        <Icon name={icon} size="xl" color="#71767B" />
      </View>
    )}
    <Text variant="title" weight="bold" center>
      {title}
    </Text>
    {description && (
      <Text variant="bodySmall" color="muted" center>
        {description}
      </Text>
    )}
    {actionLabel && onAction && <Button title={actionLabel} onPress={onAction} variant="primary" size="md" style={styles.cta} />}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing["3xl"],
  },

  iconBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },

  cta: {
    marginTop: theme.spacing.lg,
    minWidth: 160,
  },
}));
