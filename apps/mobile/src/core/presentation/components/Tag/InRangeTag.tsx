import { VariantTag } from "./VariantTag";

export const InRangeTag = ({ inRange }: { inRange: boolean }) => {
  if (inRange) return <VariantTag variant="success" glow>In Range</VariantTag>;
  return <VariantTag variant="warning" glow>Out Range</VariantTag>;
};
