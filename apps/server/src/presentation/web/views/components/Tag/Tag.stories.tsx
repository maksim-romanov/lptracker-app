import type { Meta, StoryObj } from "@storybook/html-vite";

import { Icon } from "../Icon/Icon";
import { Tag } from "./Tag";

const meta: Meta = {
  title: "Tag",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = { render: () => String(<Tag>In range</Tag>) } as Story;
export const LongLabel = { render: () => String(<Tag>Out of range for a while now</Tag>) } as Story;

// Tag has no `icon`/`iconPosition` prop — position is just children order,
// the same way `PositionDetail`'s network tag composes `NetworkLogo` + label.
export const IconLeading = {
  render: () =>
    String(
      <Tag>
        <Icon name="check" size={12} />
        Verified
      </Tag>,
    ),
} as Story;

export const IconTrailing = {
  render: () =>
    String(
      <Tag>
        Verified
        <Icon name="check" size={12} />
      </Tag>,
    ),
} as Story;
