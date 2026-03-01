import React from "react";
import { TextInput as RNTextInput, type TextInputProps, View } from "react-native";

import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { withLabel } from "./withLabel";

const UniTextInput = withUnistyles(RNTextInput);

export type TProps = TextInputProps & {
  prefix?: React.ReactNode;
  postfix?: React.ReactNode;
};

export const TextInput = withLabel(
  React.forwardRef<RNTextInput, TProps>((props, ref) => {
    const { style, prefix, postfix, editable, ...rest } = props;

    styles.useVariants({
      hasPrefix: !!prefix,
      hasPostfix: !!postfix,
      editable,
    });

    return (
      <View style={styles.container}>
        {prefix && <View style={styles.prefix}>{prefix}</View>}
        <UniTextInput
          ref={ref}
          style={[styles.input, style]}
          uniProps={(theme) => ({ placeholderTextColor: theme.onSurfaceVariant })}
          editable={editable}
          {...rest}
        />

        {postfix && <View style={styles.postfix}>{postfix}</View>}
      </View>
    );
  }),
);

const styles = StyleSheet.create((theme) => ({
  container: {
    borderWidth: 1,
    borderColor: theme.outline,
    borderRadius: theme.radius.lg,

    variants: {
      editable: {
        false: { opacity: 0.5 },
      },
    },
  },

  input: {
    fontFamily: theme.typography.input.fontFamily,
    fontSize: theme.typography.input.fontSize,
    lineHeight: theme.typography.input.lineHeight,
    color: theme.onSurface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,

    variants: {
      hasPrefix: {
        true: { paddingLeft: theme.spacing.md * 2 + 16 },
      },

      hasPostfix: {
        true: { paddingRight: theme.spacing.md * 2 + 16 },
      },
    },
  },

  prefix: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
  },

  postfix: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
  },
}));
