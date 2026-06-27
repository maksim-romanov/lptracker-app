import type { ICardVM } from "../../../../features/uniswap-v3/presentation/web/position.web-mapper";
import { Empty } from "./Empty";
import { PositionCard } from "./PositionCard";

export const Positions = ({ cards }: { cards: ICardVM[] }) =>
  cards.length === 0 ? (
    <Empty reason="no-positions" />
  ) : (
    // biome-ignore lint/complexity/noUselessFragments: Hono's JSX return type needs the fragment.
    <>
      {cards.map((card) => (
        <PositionCard card={card} />
      ))}
    </>
  );
