import { Pressable, View } from "react-native";

import { Box } from "@grapp/stacks";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

export type GlowBannerTint = "warning" | "primary" | "success" | "error";

type Props = {
  icon: IconName;
  title: string;
  description: string;
  tint?: GlowBannerTint;
  onPress?: () => void;
};

export const GlowBanner = ({ icon, title, description, tint = "primary", onPress }: Props) => {
  const { theme } = useUnistyles();
  const accent = theme[tint];

  return (
    <View style={[styles.outer, { shadowColor: accent }]}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.inner,
          {
            backgroundColor: `${accent}14`,
            borderColor: `${accent}40`,
          },
          pressed && styles.pressed,
        ]}
      >
        <Box direction="row" alignY="center" gap={3}>
          <View style={[styles.iconBubble, { backgroundColor: `${accent}26`, borderColor: `${accent}66` }]}>
            <Icon name={icon} size="lg" color={accent} />
          </View>
          <Box flex="fluid">
            <Text variant="headline" weight="bold">
              {title}
            </Text>
            <Text variant="bodySmall" color="muted">
              {description}
            </Text>
          </Box>
        </Box>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  outer: {
    borderRadius: theme.radius.lg,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },

  inner: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },

  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.7,
  },
}));
