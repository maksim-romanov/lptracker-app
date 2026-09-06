import type { Meta, StoryObj } from "@storybook/html-vite";

import { WalletChips } from "./WalletChips";

const meta: Meta = {
  title: "Wallets/WalletChips",
};
export default meta;

type Story = StoryObj<typeof meta>;

// Server-rendered state only: the wallet entries are appended by wallet_controller from the
// client store, which Storybook does not boot.
export const Empty = { render: () => String(<WalletChips />) } as Story;
