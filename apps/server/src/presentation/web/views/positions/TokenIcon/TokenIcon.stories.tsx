import type { Meta, StoryObj } from "@storybook/html-vite";

import { TokenIcon } from "./TokenIcon";

const meta: Meta = {
  title: "Positions/TokenIcon",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const WithImage = {
  render: () => String(<TokenIcon url="https://assets.uniswap.org/weth.png" symbol="WETH" class="h-8 w-8" />),
} as Story;

export const NoImageFallback = { render: () => String(<TokenIcon url="" symbol="WETH" class="h-8 w-8" />) } as Story;
