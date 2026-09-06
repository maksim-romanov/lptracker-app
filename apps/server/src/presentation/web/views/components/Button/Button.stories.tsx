import type { Meta, StoryObj } from "@storybook/html-vite";

import { Button } from "./Button";

const meta: Meta = {
  title: "Button",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Label = { render: () => String(<Button class="px-3 py-2">Connect Wallet</Button>) } as Story;

export const IconOnly = {
  render: () =>
    String(
      <Button class="p-2" aria-label="Close">
        ×
      </Button>,
    ),
} as Story;

export const Disabled = {
  render: () =>
    String(
      <Button class="px-3 py-2" disabled>
        Connect Wallet
      </Button>,
    ),
} as Story;
