import type { TPositionsLayout } from "../../../positions-layout";
import { cn } from "../../utils/cn";
import { NoPositions } from "../NoPositions/NoPositions";
import { PositionInfoCard } from "../PositionInfoCard/PositionInfoCard";
import { PositionInfoRow } from "../PositionInfoRow/PositionInfoRow";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

const HEAD_CELL = "border-outline border-b px-4 pt-3 pb-2 text-sm";

// The only place column widths are declared: `table-fixed` makes the header row
// size every column, so rows can no longer drift out of alignment with it.
const COLUMNS = [
  { label: "Pool", class: "w-[26%]" },
  { label: "Range", class: "w-[30%]" },
  { label: "Principal", class: "w-[26%]" },
  { label: "Status", class: undefined },
];

// The window frame is the table's border, and `window-bleed` spans the frame's gutters so
// the dividers reach its edge — the cell padding is the only horizontal inset left.
const PositionsTable = ({ cards }: { cards: ICardVM[] }) => (
  <table class="position-table window-bleed w-full table-fixed">
    <caption class="sr-only">Uniswap v3 positions</caption>
    <thead>
      <tr>
        {COLUMNS.map((column) => (
          <th scope="col" class={cn(HEAD_CELL, "text-left font-normal", column.class)}>
            {column.label}
          </th>
        ))}
        <th scope="col" class={cn(HEAD_CELL, "w-12")}>
          <span class="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
    <tbody>
      {cards.map((card) => (
        <PositionInfoRow card={card} />
      ))}
    </tbody>
  </table>
);

const PositionsCards = ({ cards }: { cards: ICardVM[] }) => (
  <ul aria-label="Uniswap v3 positions" class="flex flex-col gap-3">
    {cards.map((card) => (
      <PositionInfoCard card={card} />
    ))}
  </ul>
);

export const Positions = ({ cards, layout }: { cards: ICardVM[]; layout: TPositionsLayout }) => {
  if (cards.length === 0) return <NoPositions />;
  return layout === "table" ? <PositionsTable cards={cards} /> : <PositionsCards cards={cards} />;
};
