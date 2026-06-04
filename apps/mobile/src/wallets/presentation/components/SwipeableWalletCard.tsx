import { useRef } from "react";
import { Dimensions, Pressable } from "react-native";

import { container } from "core/di/container";
import { Icon } from "core/presentation/components";
import ReanimatedSwipeable, { type SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { runOnJS, type SharedValue, useAnimatedReaction, useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { WalletCard, type WalletVM } from "wallets/presentation/components/WalletCard";
import { WalletsStore } from "wallets/presentation/wallets.store";

const SCREEN_WIDTH = Dimensions.get("window").width;
const FULL_SWIPE_AT = SCREEN_WIDTH * 0.55;
const MIN_ACTION_WIDTH = 80;

type TProps = {
  wallet: WalletVM;
  onPress: () => void;
};

export const SwipeableWalletCard = ({ wallet, onPress }: TProps) => {
  const swipeRef = useRef<SwipeableMethods>(null);
  const { theme } = useUnistyles();

  const onDelete = async () => {
    swipeRef.current?.close();
    await container.resolve(WalletsStore).remove(wallet.id);
  };

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      friction={1.5}
      rightThreshold={40}
      overshootRight
      renderRightActions={(_progress, translation, swipeable) => (
        <RightAction translation={translation} swipeable={swipeable} onDelete={onDelete} color={theme.error} onColor={theme.onError} />
      )}
    >
      <WalletCard wallet={wallet} onPress={onPress} />
    </ReanimatedSwipeable>
  );
};

type TRightActionProps = {
  translation: SharedValue<number>;
  swipeable: SwipeableMethods;
  onDelete: () => void;
  color: string;
  onColor: string;
};

const RightAction = ({ translation, swipeable, onDelete, color, onColor }: TRightActionProps) => {
  const fired = useRef(false);

  const triggerDelete = () => {
    if (fired.current) return;
    fired.current = true;
    onDelete();
  };

  useAnimatedReaction(
    () => translation.value,
    (cur) => {
      if (cur < -FULL_SWIPE_AT) {
        runOnJS(triggerDelete)();
      }
    },
  );

  const actionStyle = useAnimatedStyle(() => ({
    width: Math.max(MIN_ACTION_WIDTH, -translation.value),
  }));

  return (
    <Animated.View style={[styles.action, { backgroundColor: color }, actionStyle]}>
      <Pressable
        onPress={() => {
          swipeable.close();
          triggerDelete();
        }}
        hitSlop={8}
        style={styles.tapZone}
      >
        <Icon name="trash-outline" size="md" color={onColor} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create((theme) => ({
  action: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radius.lg,
    overflow: "hidden",
  },

  tapZone: {
    width: MIN_ACTION_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
}));
