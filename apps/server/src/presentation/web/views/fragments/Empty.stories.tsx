import type { Meta, StoryObj } from "@storybook/html-vite";

import { Empty } from "./Empty";

type TEmptyReason = "no-wallets" | "no-positions";

const renderEmpty = (reason: TEmptyReason): HTMLElement => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = String(Empty({ reason }));
  return wrapper;
};

const meta: Meta<{ reason: TEmptyReason }> = {
  title: "Fragments/Empty",
  render: ({ reason }) => renderEmpty(reason),
};
export default meta;

type Story = StoryObj<typeof meta>;

export const NoWallets = { args: { reason: "no-wallets" } } as Story;
export const NoPositions = { args: { reason: "no-positions" } } as Story;
