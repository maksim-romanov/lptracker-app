import type { Meta, StoryObj } from "@storybook/html-vite";

import { TokenIcon } from "./TokenIcon";

const meta: Meta = {
  title: "Positions/TokenIcon",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const WithImage = {
  render: () => String(<TokenIcon url="https://assets.uniswap.org/weth.png" symbol="WETH" tokenRef="1:0xc02a" class="h-8 w-8" />),
} as Story;

export const NoImageFallback = { render: () => String(<TokenIcon url="" symbol="WETH" tokenRef="1:0xc02a" class="h-8 w-8" />) } as Story;

// The disc is what most of a real board renders: long-tail tokens rarely have a logo, so the
// hues have to hold up beside each other rather than one at a time.
export const FallbackHues = {
  render: () =>
    String(
      <div class="flex flex-wrap gap-2">
        {["WETH", "USDC", "PEPE", "TAO", "HOODRAT", "我的刀盾", "🔥RENTAI", "SN64", "ORCA", "BNKR", "MOLT", "GORK"].map((symbol, index) => (
          <TokenIcon url="" symbol={symbol} tokenRef={`1:0x${index}`} class="h-8 w-8" />
        ))}
      </div>,
    ),
} as Story;

// The size the amounts table uses. The monogram is sized against the disc, so it has to stay
// legible here without a second set of classes.
export const FallbackSmall = {
  render: () => String(<TokenIcon url="" symbol="PEPE" tokenRef="1:0xabc" class="h-4 w-4" />),
} as Story;
