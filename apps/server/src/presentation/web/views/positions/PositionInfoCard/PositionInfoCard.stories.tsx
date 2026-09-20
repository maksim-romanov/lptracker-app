import type { Meta, StoryObj } from "@storybook/html-vite";

import { closed, drained, fungibleLp, inRange, longAddressNoIcon, nothingOwed, outOfRange, owedUnknown } from "../__stories__/mocks";
import type { ICardVM } from "../card.vm";
import { PositionInfoCard } from "./PositionInfoCard";

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
export const Drained = { args: { card: drained } } as Story;
export const OwedUnknown = { args: { card: owedUnknown } } as Story;
export const FungibleLp = { args: { card: fungibleLp } } as Story;
export const NothingOwed = { args: { card: nothingOwed } } as Story;
export const LongAddressNoIcon = { args: { card: longAddressNoIcon } } as Story;
