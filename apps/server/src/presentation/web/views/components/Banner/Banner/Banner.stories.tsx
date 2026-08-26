import type { Meta, StoryObj } from "@storybook/html-vite";

import { Banner } from "./Banner";

const meta: Meta = {
  title: "Banner",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const ErrorVariant = { render: () => String(<Banner variant="error">2 source(s) failed to load.</Banner>) } as Story;
export const Warning = {
  render: () => String(<Banner variant="warning">Prices may be a few minutes stale.</Banner>),
} as Story;
export const Success = { render: () => String(<Banner variant="success">Wallet added.</Banner>) } as Story;
