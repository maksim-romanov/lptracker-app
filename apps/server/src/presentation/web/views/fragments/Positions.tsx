import type { ICardVM } from "../../../../features/uniswap-v3/presentation/web/position.web-mapper";
import { Empty } from "./Empty";
import { PositionCard } from "./PositionCard";

export const Positions = ({ cards }: { cards: ICardVM[] }) =>
  cards.length === 0 ? (
    <Empty reason="no-positions" />
  ) : (
    <>
      <div class="board-header" aria-hidden="true">
        <span>Pool</span>
        <span>Range</span>
        <span>Principal</span>
        <span>Status</span>
        <span />
      </div>
      {cards.map((card) => (
        <PositionCard card={card} />
      ))}
    </>
  );
