import type { Meta, StoryObj } from "@storybook/html-vite";

import { TextInput } from "./TextInput";

const meta: Meta = {
  title: "Form/TextInput",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => String(<TextInput class="px-3 py-2" placeholder="0x… wallet address" />),
} as Story;

export const Required = {
  render: () =>
    String(<TextInput class="px-3 py-2" placeholder="0x… wallet address" required pattern="^0x[a-fA-F0-9]{40}$" aria-label="Wallet address" />),
} as Story;
