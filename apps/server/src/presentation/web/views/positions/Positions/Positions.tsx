import { NoPositions } from "../NoPositions/NoPositions";
import { PositionCard } from "../PositionCard/PositionCard";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

export const Positions = ({ cards }: { cards: ICardVM[] }) =>
  cards.length === 0 ? (
    <NoPositions />
  ) : (
    <div class="@container flex flex-col gap-3 md:rounded-md md:border md:border-outline md:bg-surface-container md:p-4">
      <div aria-hidden="true" class="hidden gap-4 border-outline border-b pb-2 text-sm md:flex">
        <span class="flex-1">Pool</span>
        <span class="flex-1">Range</span>
        <span class="flex-1">Principal</span>
        <span>Status</span>
        <span class="w-8" />
      </div>
      {cards.map((card) => (
        <PositionCard card={card} />
      ))}
    </div>
  );
