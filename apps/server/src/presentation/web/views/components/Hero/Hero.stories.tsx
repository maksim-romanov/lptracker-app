import type { Meta, StoryObj } from "@storybook/html-vite";

import { Hero } from "./Hero";

const meta: Meta = {
  title: "Hero",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => String(<Hero title="Every position, every chain" description="Fees, balances and range across every wallet you track." />),
} as Story;
