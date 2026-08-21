import type { ICardVM } from "../../../../features/uniswap-v3/presentation/web/position.web-mapper";
import { Empty } from "./Empty";
import { PositionCard } from "./PositionCard";

export const Positions = ({ cards }: { cards: ICardVM[] }) =>
  cards.length === 0 ? (
    <Empty reason="no-positions" />
  ) : (
    <>
      <div aria-hidden="true" class="hidden gap-4 border-b border-outline pb-2 text-sm @md:flex">
        <span class="flex-1">Pool</span>
        <span class="flex-1">Range</span>
        <span class="flex-1">Principal</span>
        <span>Status</span>
        <span class="w-8" />
      </div>
      {cards.map((card) => (
        <PositionCard card={card} />
      ))}
    </>
  );
