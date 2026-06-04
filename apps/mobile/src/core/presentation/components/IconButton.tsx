import { Pressable, type PressableProps, type ViewStyle } from "react-native";

import { StyleSheet, type UnistylesVariants } from "react-native-unistyles";

import { Icon, type IconName, type IconSize } from "./Icon";

type Variants = UnistylesVariants<typeof styles>;

type Props = Omit<PressableProps, "style"> &
  Variants & {
    name: IconName;
    iconSize?: IconSize;
    color?: string;
    style?: ViewStyle;
  };

export const IconButton = ({ name, iconSize = "md", color, variant = "ghost", size = "md", style, ...rest }: Props) => {
  styles.useVariants({ variant, size });

  return (
    <Pressable {...rest} style={({ pressed }) => [styles.container, pressed && styles.pressed, style]} hitSlop={8}>
      <Icon name={name} size={iconSize} color={color} />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,

    variants: {
      variant: {
        ghost: { backgroundColor: "transparent" },
        filled: { backgroundColor: theme.surfaceContainer },
        outlined: { borderWidth: 1, borderColor: theme.outline },
      },

      size: {
        sm: { width: 32, height: 32 },
        md: { width: 40, height: 40 },
        lg: { width: 48, height: 48 },
      },
    },
  },

  pressed: {
    opacity: 0.55,
  },
}));
