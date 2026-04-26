import { type GestureResponderEvent, Platform, Pressable, type PressableProps } from "react-native";

import * as Haptics from "expo-haptics";

export type HapticImpact = "selection" | "light" | "medium" | "heavy" | "soft" | "rigid" | "success" | "warning" | "error";

const trigger = (impact: HapticImpact) => {
  if (Platform.OS === "web") return;

  switch (impact) {
    case "selection":
      Haptics.selectionAsync();
      return;
    case "light":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    case "medium":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    case "heavy":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    case "soft":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      return;
    case "rigid":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      return;
    case "success":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    case "warning":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    case "error":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
  }
};

export type Props = {
  /** Haptic feedback fired on press-in. Defaults to "light". Pass `false` to disable. */
  impact?: HapticImpact | false;
} & PressableProps;

/**
 * Drop-in replacement for `Pressable` that triggers a haptic on touch-down.
 *
 * Defaults: light impact for taps; pass `impact="medium"` for primary actions
 * (Save, Confirm), `impact="heavy"` for destructive actions, `impact="success"`
 * for completion confirmation.
 */
export const HapticPressable = ({ impact = "light", onPressIn, ...rest }: Props) => {
  const handlePressIn = (event: GestureResponderEvent) => {
    if (impact !== false) trigger(impact);
    onPressIn?.(event);
  };

  return <Pressable {...rest} onPressIn={handlePressIn} />;
};
