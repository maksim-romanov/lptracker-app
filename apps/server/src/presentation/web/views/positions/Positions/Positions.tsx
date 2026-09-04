import type { TPositionsLayout } from "../../../positions-layout";
import { cn } from "../../utils/cn";
import { NoPositions } from "../NoPositions/NoPositions";
import { PositionInfoCard } from "../PositionInfoCard/PositionInfoCard";
import { PositionInfoRow } from "../PositionInfoRow/PositionInfoRow";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

const HEAD_CELL = "bg-surface-container px-3 py-2.5 text-caption font-normal text-on-surface-variant first:ps-5 last:pe-5";

const COLUMNS = [
  { label: "Position", class: "w-[34%] text-left" },
  { label: "Range", class: "w-[30%] text-left" },
  { label: "Amounts", class: "w-[18%] text-right" },
  { label: "Unclaimed fees", class: "text-right" },
];

const CAPTION_ID = "positions-table-caption";

// The scroller carries tabindex={0} and aria-labelledby: a region that scrolls has to be
// reachable without a mouse (WCAG 2.1.1).
const PositionsTable = ({ cards }: { cards: ICardVM[] }) => (
  <section class="position-table-scroll shell-bleed overflow-x-auto" tabindex={0} aria-labelledby={CAPTION_ID}>
    <table class="position-table w-full min-w-[52rem] table-fixed">
      <caption id={CAPTION_ID} class="sr-only">
        Uniswap v3 positions
      </caption>
      <thead>
        <tr>
          {COLUMNS.map((column) => (
            <th scope="col" class={cn(HEAD_CELL, column.class)}>
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
