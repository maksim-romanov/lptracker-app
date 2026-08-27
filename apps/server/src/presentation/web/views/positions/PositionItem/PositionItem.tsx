import type { TPositionsLayout } from "../../../positions-layout";
import { PositionInfoCard } from "../PositionInfoCard/PositionInfoCard";
import { PositionInfoRow } from "../PositionInfoRow/PositionInfoRow";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

// One position in whichever presentation the board is currently rendered in. Only the
// per-position swap endpoint needs this: Positions.tsx picks the container first, and a
// container already implies its item type.
export const PositionItem = ({ card, layout }: { card: ICardVM; layout: TPositionsLayout }) =>
  layout === "table" ? <PositionInfoRow card={card} /> : <PositionInfoCard card={card} />;
