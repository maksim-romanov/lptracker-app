import { forwardRef } from "react";
import { TextInput as RNTextInput, type StyleProp, type TextInputProps, View, type ViewStyle } from "react-native";

import { pipe } from "fp-ts/function";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { withAnimatedBorder } from "./withAnimatedBorder";
import { withLabel } from "./withLabel";

const UniTextInput = withUnistyles(RNTextInput);

export type TProps = TextInputProps & {
  prefix?: React.ReactNode;
  postfix?: React.ReactNode;

  isError?: boolean;
  isValid?: boolean;

  containerStyle?: StyleProp<ViewStyle>;
};

export const TextInput = pipe(
  (props, ref) => {
    const { style, prefix, postfix, editable, isError, containerStyle, ...rest } = props;

    styles.useVariants({
      hasPrefix: !!prefix,
      hasPostfix: !!postfix,
      editable,
    });

    return (
      <View style={[styles.container, containerStyle]}>
        {prefix && <View style={styles.prefix}>{prefix}</View>}

        <UniTextInput
          ref={ref}
          style={[styles.input, style]}
          editable={editable}
          uniProps={(theme) => ({ placeholderTextColor: theme.onSurfaceVariant })}
          {...rest}
        />

        {postfix && <View style={styles.postfix}>{postfix}</View>}
      </View>
    );
  },
  forwardRef<RNTextInput, TProps>,
  withLabel,
  withAnimatedBorder,
);

const styles = StyleSheet.create((theme) => ({
  container: {
    borderWidth: 1,
    borderColor: theme.outline,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.surface,
    // overflow: "hidden",

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
