import type { Meta, StoryObj } from "@storybook/html-vite";

import { Logo } from "./Logo";

const meta: Meta = {
  title: "Logo",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = { render: () => String(<Logo />) } as Story;
