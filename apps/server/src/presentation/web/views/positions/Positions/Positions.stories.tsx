import type { Meta, StoryObj } from "@storybook/html-vite";

import type { TPositionsLayout } from "../../../positions-layout";
import { closed, inRange, outOfRange } from "../__stories__/mocks";
import { Positions } from "./Positions";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

type Args = { cards: ICardVM[]; layout: TPositionsLayout };

const renderPositions = ({ cards, layout }: Args): HTMLElement => {
  const wrapper = document.createElement("div");
  if (layout === "cards") wrapper.className = "max-w-sm";
  wrapper.innerHTML = String(Positions({ cards, layout }));
  return wrapper;
};

const meta: Meta<Args> = {
  title: "Positions/Positions",
  render: (args) => renderPositions(args),
};
export default meta;

type Story = StoryObj<typeof meta>;

const every = [inRange, outOfRange, closed];

export const NoCards = { args: { cards: [], layout: "cards" } } as Story;
export const TableLayout = { args: { cards: every, layout: "table" } } as Story;
export const CardsLayout = { args: { cards: every, layout: "cards" } } as Story;
export const TableSingle = { args: { cards: [inRange], layout: "table" } } as Story;
