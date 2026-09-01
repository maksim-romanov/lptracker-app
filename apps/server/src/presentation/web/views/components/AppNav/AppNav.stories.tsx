import type { Meta, StoryObj } from "@storybook/html-vite";

import { Button } from "../Button/Button";
import { AppNav } from "./AppNav";

const meta: Meta = {
  title: "AppNav",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = { render: () => String(<AppNav />) } as Story;

export const WithActions = {
  render: () =>
    String(
      <AppNav
        actions={<Button class="rounded-full border-transparent bg-primary px-4 py-2 text-button text-on-primary">Connect Wallet</Button>}
      />,
    ),
} as Story;
