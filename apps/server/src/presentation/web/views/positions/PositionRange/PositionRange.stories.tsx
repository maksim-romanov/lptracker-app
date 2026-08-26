import type { Meta, StoryObj } from "@storybook/html-vite";

import { inRange, outOfRange } from "../__stories__/mocks";
import { PositionRange } from "./PositionRange";

const meta: Meta = {
  title: "Positions/PositionRange",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const InRange = { render: () => String(<PositionRange range={inRange.priceRange} />) } as Story;
export const OutOfRange = { render: () => String(<PositionRange range={outOfRange.priceRange} />) } as Story;
