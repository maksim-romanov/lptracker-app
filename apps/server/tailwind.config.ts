import { radius, spacing } from "@depthly/theme";

const px = (o: Record<string, number>): Record<string, string> => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, `${v}px`]));

export default {
  theme: {
    extend: {
      spacing: px(spacing),
      borderRadius: px(radius),
    },
  },
};
