import { Pressable } from "react-native";

import AntDesign from "@expo/vector-icons/AntDesign";
import { container } from "core/di/container";
import { observer } from "mobx-react-lite";
import { ToggleInvertedUseCase } from "positions/application/usecases/toggle-inverted.usecase";
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

  const handlePress = () => {
    void container.resolve(ToggleInvertedUseCase).execute(positionRef);
  };

  return (
    <Pressable
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={inverted ? "Reset pair order" : "Invert pair order"}
      accessibilityState={{ selected: inverted }}
      onPress={handlePress}
    >
      <AntDesign name="swap" size={size} color={theme.onSurfaceVariant} />
    </Pressable>
  );
});
