import type { Meta, StoryObj } from "@storybook/html-vite";

import { closed, inRange, longAddressNoIcon, noFees, outOfRange } from "../__stories__/mocks";
import { PositionDetail } from "./PositionDetail";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

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
export const NoFees = { args: { card: noFees } } as Story;
export const LongAddressNoIcon = { args: { card: longAddressNoIcon } } as Story;
