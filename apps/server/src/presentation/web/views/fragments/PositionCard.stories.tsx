import type { Meta, StoryObj } from "@storybook/html-vite";

import type { ICardVM } from "../../../../features/uniswap-v3/presentation/web/position.web-mapper";
import { closed, inRange, longAddressNoIcon, noFees, outOfRange } from "./__stories__/mocks";
import { PositionCard } from "./PositionCard";

const renderCard = (card: ICardVM): HTMLElement => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = String(PositionCard({ card }));
  return wrapper;
};

const meta: Meta<{ card: ICardVM }> = {
  title: "Fragments/PositionCard",
  render: ({ card }) => renderCard(card),
};
export default meta;

type Story = StoryObj<typeof meta>;

export const InRange = { args: { card: inRange } } as Story;
export const OutOfRange = { args: { card: outOfRange } } as Story;
export const Closed = { args: { card: closed } } as Story;
export const NoFees = { args: { card: noFees } } as Story;
export const LongAddressNoIcon = { args: { card: longAddressNoIcon } } as Story;
