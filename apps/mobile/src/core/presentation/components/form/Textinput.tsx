import React from "react";
import type { TextInput as RNTextInput } from "react-native";

import type { AnyFieldApi } from "@tanstack/react-form";

import type { TProps as TextInputProps } from "../TextInput/TextInput";
import { TextInput } from "../TextInput/TextInput";
import { withLabel } from "../TextInput/withLabel";

export const LabeledTextInput = withLabel(TextInput);

type TProps = {
  field: AnyFieldApi;
  label?: string;
} & Omit<TextInputProps, "value" | "onChangeText" | "onBlur">;

export const TextInputAdapter = React.forwardRef<RNTextInput, TProps>(({ field, label, ...rest }, ref) => {
  return (
    <LabeledTextInput ref={ref} label={label} value={field.state.value} onChangeText={field.handleChange} onBlur={field.handleBlur} {...rest} />
  );
});
