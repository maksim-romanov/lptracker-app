import type { Meta, StoryObj } from "@storybook/html-vite";

import { closed, inRange, outOfRange } from "../__stories__/mocks";
import { Positions } from "./Positions";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

const renderPositions = (cards: ICardVM[]): HTMLElement => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = String(Positions({ cards }));
  return wrapper;
};

const meta: Meta<{ cards: ICardVM[] }> = {
  title: "Positions/Positions",
  render: ({ cards }) => renderPositions(cards),
};
export default meta;

type Story = StoryObj<typeof meta>;

export const NoCards = { args: { cards: [] } } as Story;
export const SingleCard = { args: { cards: [inRange] } } as Story;
export const MultipleCards = { args: { cards: [inRange, outOfRange, closed] } } as Story;
