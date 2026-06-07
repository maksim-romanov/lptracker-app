import { Pressable } from "react-native";

import AntDesign from "@expo/vector-icons/AntDesign";
import { container } from "core/di/container";
import { observer } from "mobx-react-lite";
import { PositionViewPrefsStore } from "positions/presentation/stores/position-view-prefs.store";
import { useUnistyles } from "react-native-unistyles";

type TProps = {
  positionRef: string;
  size?: number;
};

export const InvertPairButton = observer(function InvertPairButton({ positionRef, size = 18 }: TProps) {
  const store = container.resolve(PositionViewPrefsStore);
  const inverted = store.isInverted(positionRef);
  const { theme } = useUnistyles();

  return (
    <Pressable
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={inverted ? "Reset pair order" : "Invert pair order"}
      accessibilityState={{ selected: inverted }}
      onPress={() => store.toggleInverted(positionRef)}
    >
      <AntDesign name="swap" size={size} color={theme.onSurfaceVariant} />
    </Pressable>
  );
});
