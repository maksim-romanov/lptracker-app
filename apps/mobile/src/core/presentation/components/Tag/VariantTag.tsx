import type React from "react";
import type { ViewProps } from "react-native";

import { useUnistyles } from "react-native-unistyles";

import { Tag } from "./Tag";

const VARIANT_MAP = {
  success: "success",
  warning: "warning",
  error: "error",
} as const;

type TProps = {
  variant: keyof typeof VARIANT_MAP;
  glow?: boolean;
} & Pick<ViewProps, "style">;

export const VariantTag = ({ variant, ...rest }: React.PropsWithChildren<TProps>) => {
  const { theme } = useUnistyles();
  const color = theme[VARIANT_MAP[variant]];

  return <Tag color={color} {...rest} />;
};
