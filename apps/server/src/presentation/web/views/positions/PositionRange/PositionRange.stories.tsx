import type { Meta, StoryObj } from "@storybook/html-vite";

import { closed, inRange, nearLowerBound, nearUpperBound, outOfRange } from "../__stories__/mocks";
import { PositionRange } from "./PositionRange";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// The bar fills its container, so a story without one would stretch to the whole canvas.
const renderRange = (card: ICardVM): HTMLElement => {
  const host = document.createElement("div");
  host.className = "max-w-[12rem]";
  host.innerHTML = String(<PositionRange range={card.priceRange} tone={card.rangeTone} />);
  return host;
};

const meta: Meta = {
  title: "Positions/PositionRange",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const InRange = { render: () => renderRange(inRange) } as Story;
export const NearLowerBound = { render: () => renderRange(nearLowerBound) } as Story;
export const NearUpperBound = { render: () => renderRange(nearUpperBound) } as Story;
export const OutOfRange = { render: () => renderRange(outOfRange) } as Story;
export const Closed = { render: () => renderRange(closed) } as Story;
