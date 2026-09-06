import type { Meta, StoryObj } from "@storybook/html-vite";

import { NoPositions } from "./NoPositions";

const meta: Meta = {
  title: "Positions/NoPositions",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = { render: () => String(<NoPositions />) } as Story;
