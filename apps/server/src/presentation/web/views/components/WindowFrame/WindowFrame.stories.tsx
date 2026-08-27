import type { Meta, StoryObj } from "@storybook/html-vite";

import { WindowFrame } from "./WindowFrame";

const meta: Meta = {
  title: "WindowFrame",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => String(<WindowFrame title="Positions">Window content</WindowFrame>),
} as Story;

export const LongTitle = {
  render: () =>
    String(
      <WindowFrame class="max-w-[24rem]" title="A title long enough to be truncated by the frame">
        Window content
      </WindowFrame>,
    ),
} as Story;
