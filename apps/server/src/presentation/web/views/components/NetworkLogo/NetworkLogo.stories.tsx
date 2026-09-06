import type { Meta, StoryObj } from "@storybook/html-vite";

import { NetworkLogo } from "./NetworkLogo";

const meta: Meta = {
  title: "NetworkLogo",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Ethereum = { render: () => String(<NetworkLogo chainId={1} size={24} />) } as Story;
export const Base = { render: () => String(<NetworkLogo chainId={8453} size={24} />) } as Story;
export const Arbitrum = { render: () => String(<NetworkLogo chainId={42161} size={24} />) } as Story;
