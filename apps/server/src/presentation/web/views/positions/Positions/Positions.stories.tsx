import type { Meta, StoryObj } from "@storybook/html-vite";

import type { TPositionsLayout } from "../../../positions-layout";
import { AppShell } from "../../components/AppShell/AppShell";
import { closed, inRange, nearUpperBound, outOfRange } from "../__stories__/mocks";
import { Positions } from "./Positions";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

type Args = { cards: ICardVM[]; layout: TPositionsLayout };

// Rendered inside the frame it ships in: the table bleeds to the frame's edge, so on its
// own it would be missing the border its dividers are meant to meet.
const renderPositions = ({ cards, layout }: Args): HTMLElement => {
  const host = document.createElement("div");
  if (layout === "cards") host.className = "max-w-[24rem]";
  host.innerHTML = String(
    <AppShell class="shell-grid shell-content">
      <Positions cards={cards} layout={layout} />
    </AppShell>,
  );
  return host;
};

const meta: Meta<Args> = {
  title: "Positions/Positions",
  render: (args) => renderPositions(args),
};
export default meta;

type Story = StoryObj<typeof meta>;

const every = [inRange, nearUpperBound, outOfRange, closed];

export const NoCards = { args: { cards: [], layout: "cards" } } as Story;
export const TableLayout = { args: { cards: every, layout: "table" } } as Story;
export const CardsLayout = { args: { cards: every, layout: "cards" } } as Story;
export const TableSingle = { args: { cards: [inRange], layout: "table" } } as Story;
