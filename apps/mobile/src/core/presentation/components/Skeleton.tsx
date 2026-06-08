import type { ReactElement } from "react";
import type { DimensionValue } from "react-native";

import { Skeleton as MotiSkeleton } from "moti/skeleton";
import { useUnistyles } from "react-native-unistyles";

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number | "round" | "square";
  children?: ReactElement;
  show?: boolean;
};

const SkeletonBase = ({ width = "100%", height = 16, radius = 8, children, show }: Props) => {
  const { theme } = useUnistyles();
  return (
    <MotiSkeleton
      width={width}
      height={height}
      radius={radius}
      show={show}
      colors={[theme.surfaceContainer, theme.surfaceVariant, theme.surfaceContainer]}
    >
      {children}
    </MotiSkeleton>
  );
};

export const Skeleton = Object.assign(SkeletonBase, { Group: MotiSkeleton.Group });
