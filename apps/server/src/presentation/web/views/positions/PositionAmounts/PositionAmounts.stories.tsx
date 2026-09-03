import type { Meta, StoryObj } from "@storybook/html-vite";

import { inRange, noFees } from "../__stories__/mocks";
import { PositionAmounts } from "./PositionAmounts";

const meta: Meta = {
  title: "Positions/PositionAmounts",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const WithFees = { render: () => String(<PositionAmounts class="max-w-[22rem]" card={inRange} />) } as Story;
export const NoFees = { render: () => String(<PositionAmounts class="max-w-[22rem]" card={noFees} />) } as Story;

// The detail panel's variant: each token names the contract it stands for and links to it.
export const WithContract = { render: () => String(<PositionAmounts class="max-w-[22rem]" card={inRange} withContract />) } as Story;
