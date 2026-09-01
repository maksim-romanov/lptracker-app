import type { TPositionsLayout } from "../../../positions-layout";
import { cn } from "../../utils/cn";
import { NoPositions } from "../NoPositions/NoPositions";
import { PositionInfoCard } from "../PositionInfoCard/PositionInfoCard";
import { PositionInfoRow } from "../PositionInfoRow/PositionInfoRow";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// A filled bar rather than a ruled row: it names the columns without drawing a line the rows
// then have to answer with lines of their own. Rounded at both ends so it reads as one object
// sitting above the list, not as a first row of it.
const HEAD_CELL = "bg-surface-container px-3 py-2.5 text-caption font-normal text-on-surface-variant";

// The only place column widths are declared: `table-fixed` makes the header row size every
// column, so rows can no longer drift out of alignment with it. A numeric column's label is
// right-aligned with its digits — a left-aligned header over right-aligned numbers detaches
// the two.
const COLUMNS = [
  { label: "Position", class: "w-[34%] text-left" },
  { label: "Range", class: "w-[30%] text-left" },
  { label: "Amounts", class: "w-[18%] text-right" },
  { label: "Unclaimed fees", class: "text-right" },
];

const CAPTION_ID = "positions-table-caption";

// The shell is the table's border, and `shell-bleed` spans the shell's gutters so the dividers
// reach its edge — the cell padding is the only horizontal inset left.
// The scroller is focusable and named because it is one: the viewport used to be the only
// thing choosing this presentation, so it was never narrower than the table. Now that someone
// can ask for the table on a phone, a region that scrolls has to be reachable without a mouse
// (WCAG 2.1.1). A named <section> already is a region, and it borrows the caption's wording
// rather than inventing a second name for the same thing.
const PositionsTable = ({ cards }: { cards: ICardVM[] }) => (
  <section class="shell-bleed overflow-x-auto" tabindex={0} aria-labelledby={CAPTION_ID}>
    <table class="position-table w-full min-w-[52rem] table-fixed">
      <caption id={CAPTION_ID} class="sr-only">
        Uniswap v3 positions
      </caption>
      <thead>
        <tr>
          {COLUMNS.map((column, index) => (
            <th scope="col" class={cn(HEAD_CELL, column.class, index === 0 && "rounded-s-md", index === COLUMNS.length - 1 && "rounded-e-md")}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {cards.map((card) => (
          <PositionInfoRow card={card} />
        ))}
      </tbody>
    </table>
  </section>
);

// Auto-fill rather than auto-fit: with two positions left, auto-fit would stretch each card to
// half the board, and a card whose width depends on how many neighbours it has is a card whose
// contents reflow every time one closes.
const PositionsCards = ({ cards }: { cards: ICardVM[] }) => (
  <ul aria-label="Uniswap v3 positions" class="grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] gap-3">
    {cards.map((card) => (
      <PositionInfoCard card={card} />
    ))}
  </ul>
);

export const Positions = ({ cards, layout }: { cards: ICardVM[]; layout: TPositionsLayout }) => {
  if (cards.length === 0) return <NoPositions />;
  return layout === "table" ? <PositionsTable cards={cards} /> : <PositionsCards cards={cards} />;
};
