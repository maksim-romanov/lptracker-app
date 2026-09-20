import type { Meta, StoryObj } from "@storybook/html-vite";

import { closed, drained, fungibleLp, inRange, longAddressNoIcon, nothingOwed, outOfRange, owedUnknown } from "../__stories__/mocks";
import type { ICardVM } from "../card.vm";
import { PositionDetail } from "./PositionDetail";

const renderDetail = (card: ICardVM): HTMLElement => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = String(PositionDetail({ card }));
  return wrapper;
};

const meta: Meta<{ card: ICardVM }> = {
  title: "Positions/PositionDetail",
  render: ({ card }) => renderDetail(card),
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
