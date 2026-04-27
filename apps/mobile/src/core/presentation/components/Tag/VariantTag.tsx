import type { PropsWithChildren } from "react";
import type { ViewProps } from "react-native";

import { useUnistyles } from "react-native-unistyles";

import { Tag, type TagSize, type TagTone } from "./Tag";

const VARIANT_MAP = {
  success: "success",
  warning: "warning",
  error: "error",
} as const;

type Props = {
  variant: keyof typeof VARIANT_MAP;
  size?: TagSize;
  tone?: TagTone;
} & Pick<ViewProps, "style">;

export const VariantTag = ({ variant, ...rest }: PropsWithChildren<Props>) => {
  const { theme } = useUnistyles();
  const color = theme[VARIANT_MAP[variant]];

  return <Tag color={color} {...rest} />;
};
