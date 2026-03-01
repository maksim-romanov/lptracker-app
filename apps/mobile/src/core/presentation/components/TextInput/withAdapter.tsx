import React from "react";
import type { TextInput } from "react-native";

import type { AnyFieldApi } from "@tanstack/react-form";

import type { TProps as TextInputProps } from "./TextInput";

type TProps<T extends TextInputProps> = { field: AnyFieldApi } & Omit<T, "value" | "onChangeText" | "onBlur">;

export const withAdapter = <T extends TextInputProps>(Component: React.ComponentType<T>) => {
  return React.forwardRef<TextInput, TProps<T>>((props, ref) => {
    const { field, ...rest } = props as TProps<T>;

    return (
      <Component
        ref={ref}
        value={field.state.value}
        onChangeText={field.handleChange}
        onBlur={field.handleBlur}
        isError={field.state.meta.isDirty && field.state.meta.errors.length > 0}
        isValid={field.state.meta.isDirty && field.state.meta.isValid}
        {...(rest as unknown as T)}
      />
    );
  });
};
