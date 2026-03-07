import numbro from "numbro";
import { useUnistyles } from "react-native-unistyles";

import { Tag } from "./Tag";

export const FeeBpsTag = ({ feeBps }: { feeBps: number }) => {
  const { theme } = useUnistyles();

  return (
    <Tag color={theme.secondary}>
      {numbro(feeBps / 1_000_000).format({
        output: "percent",
        mantissa: 2,
        trimMantissa: true,
        spaceSeparated: false,
      })}
    </Tag>
  );
};
