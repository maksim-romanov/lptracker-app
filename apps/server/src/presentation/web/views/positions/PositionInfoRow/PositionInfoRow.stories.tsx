import type { Meta, StoryObj } from "@storybook/html-vite";

import { closed, drained, fungibleLp, inRange, longAddressNoIcon, nothingOwed, outOfRange, owedUnknown } from "../__stories__/mocks";
import type { ICardVM } from "../card.vm";
import { PositionInfoRow } from "./PositionInfoRow";

// A bare <tr> is discarded by the parser unless it is assigned inside table context.
const renderRow = (card: ICardVM): HTMLElement => {
  const table = document.createElement("table");
  table.className = "position-table w-full table-fixed";
  const body = document.createElement("tbody");
  body.innerHTML = String(PositionInfoRow({ card }));
  table.append(body);
  return table;
};

const meta: Meta<{ card: ICardVM }> = {
  title: "Positions/PositionInfoRow",
  render: ({ card }) => renderRow(card),
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
