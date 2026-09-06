import type { Meta, StoryObj } from "@storybook/html-vite";

import { WalletConnect } from "./WalletConnect";

const meta: Meta = {
  title: "Wallets/WalletConnect",
};
export default meta;

type Story = StoryObj<typeof meta>;

// The empty state is all the server renders. Both groups and their rows are cloned from the
// <template> by wallet_controller out of the client-side store, which Storybook does not boot
// — a nickname never leaves the browser, so there is nothing here for the server to know.
export const Empty = { render: () => String(<WalletConnect />) } as Story;
