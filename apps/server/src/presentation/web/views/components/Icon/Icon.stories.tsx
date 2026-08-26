import type { Meta, StoryObj } from "@storybook/html-vite";

import { Icon } from "./Icon";

const meta: Meta = {
  title: "Icon",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = { render: () => String(<Icon name="wallet" />) } as Story;
export const Small = { render: () => String(<Icon name="check" size={12} />) } as Story;
export const Large = { render: () => String(<Icon name="alert" size={32} />) } as Story;
