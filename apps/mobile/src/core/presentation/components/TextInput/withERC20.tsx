import React from "react";
import { type TextInput, View } from "react-native";

import { StyleSheet } from "react-native-unistyles";

import { Icon } from "../Icon";
// import { Text } from "../Text";
import type { TProps as TextInputProps } from "./TextInput";

export const withERC20 = <T extends TextInputProps>(Component: React.ComponentType<T>) => {
  return React.forwardRef<TextInput, T>((props, ref) => {
    // styles.useVariants({ editable });

    return (
      <Component
        ref={ref}
        postfix={<Icon name="wallet-outline" size="sm" />}
        placeholder="0x..."
        autoCapitalize="none"
        autoCorrect={false}
        {...(props as T)}
      />
    );
  });
};

const styles = StyleSheet.create((theme) => ({}));
