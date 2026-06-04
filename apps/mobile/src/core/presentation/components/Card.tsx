import type React from "react";
import { Pressable, type PressableProps, View, type ViewStyle } from "react-native";

import { StyleSheet, type UnistylesVariants } from "react-native-unistyles";

type Variants = UnistylesVariants<typeof styles>;

type Props = Variants &
  Omit<PressableProps, "style" | "children" | "onPress"> & {
    onPress?: () => void;
    style?: ViewStyle;
    children?: React.ReactNode;
  };

export const Card = ({ variant = "elevated", padding = "lg", onPress, children, style, ...rest }: Props) => {
  styles.useVariants({ variant, padding, pressable: !!onPress });

  if (onPress) {
    return (
      <Pressable {...rest} onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create((theme) => ({
  container: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",

    variants: {
      variant: {
        // Lifted dark card on pure-black bg
        elevated: {
          backgroundColor: theme.surfaceContainer,
        },
        // Transparent fill, defined border — sits directly on the page surface (X-style).
        outlined: {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: theme.outline,
        },
        // Flat, no border, no fill — for stacked rows
        flat: {
          backgroundColor: "transparent",
        },
      },

      padding: {
        none: { padding: 0 },
        sm: { padding: theme.spacing.md },
        md: { padding: theme.spacing.lg },
        lg: { padding: theme.spacing.xl },
      },

      pressable: {
        true: {},
      },
    },
  },

  pressed: {
    opacity: 0.7,
  },
}));
