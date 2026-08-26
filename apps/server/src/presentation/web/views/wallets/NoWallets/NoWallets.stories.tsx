import type { Meta, StoryObj } from "@storybook/html-vite";

import { NoWallets } from "./NoWallets";

const meta: Meta = {
  title: "Wallets/NoWallets",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = { render: () => String(<NoWallets />) } as Story;
