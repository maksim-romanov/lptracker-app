import type { Meta, StoryObj } from "@storybook/html-vite";

import { closed, inRange, longAddressNoIcon, noFees, outOfRange } from "../__stories__/mocks";
import { PositionInfoCard } from "./PositionInfoCard";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// A bare <li> needs a list parent to be parsed, and the card is styled as a list item.
const renderCard = (card: ICardVM): HTMLElement => {
  const list = document.createElement("ul");
  list.className = "flex max-w-[24rem] flex-col gap-3";
  list.innerHTML = String(PositionInfoCard({ card }));
  return list;
};

const meta: Meta<{ card: ICardVM }> = {
  title: "Positions/PositionInfoCard",
  render: ({ card }) => renderCard(card),
};
export default meta;

type Story = StoryObj<typeof meta>;

export const InRange = { args: { card: inRange } } as Story;
export const OutOfRange = { args: { card: outOfRange } } as Story;
export const Closed = { args: { card: closed } } as Story;
export const NoFees = { args: { card: noFees } } as Story;
export const LongAddressNoIcon = { args: { card: longAddressNoIcon } } as Story;
