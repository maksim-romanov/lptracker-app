import { useUnistyles } from "react-native-unistyles";

import { Tag } from "./Tag";

export const InRangeTag = ({ inRange }: { inRange: boolean }) => {
  const { theme } = useUnistyles();
  const color = inRange ? theme.success : theme.warning;

  return (
    <Tag color={color} tone="filled">
      {inRange ? "In range" : "Out of range"}
    </Tag>
  );
};
