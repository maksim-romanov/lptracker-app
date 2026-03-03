import type React from "react";
import { ActivityIndicator, View } from "react-native";

import { StyleSheet, withUnistyles } from "react-native-unistyles";

import type { TProps as ButtonProps } from "./Button";

const UniActivityIndicator = withUnistyles(ActivityIndicator);

export const withLoading = <T extends ButtonProps>(Component: React.ComponentType<T>) => {
  return ({ loading, ...rest }: T & { loading?: boolean }) => {
    styles.useVariants({ loading });

    return (
      <View style={styles.container}>
        <Component {...(rest as T)} disabled={rest.disabled || loading} style={[styles.button, rest.style]} />

        {loading && (
          <UniActivityIndicator
            size="small"
            style={[StyleSheet.absoluteFill, styles.loader]}
            uniProps={(theme) => {
              const colorByVariant = {
                filled: theme.onPrimary,
                outline: theme.primary,
                destructive: theme.error,
              } as const;

              return { color: colorByVariant[rest.variant ?? "filled"] };
            }}
          />
        )}
      </View>
    );
  };
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },

  loader: {
    alignSelf: "center",
  },

  button: {
    variants: {
      loading: { true: { opacity: 0.25 } },
    },
  },
});
