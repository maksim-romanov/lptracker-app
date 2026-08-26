import type { Meta, StoryObj } from "@storybook/html-vite";

import { WalletConnect } from "./WalletConnect";

const meta: Meta = {
  title: "Wallets/WalletConnect",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = { render: () => String(<WalletConnect />) } as Story;
