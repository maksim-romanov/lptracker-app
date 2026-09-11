import type { TPositionsLayout } from "../../../positions-layout";
import type { ICardVM } from "../card.vm";
import { PositionInfoCard } from "../PositionInfoCard/PositionInfoCard";
import { PositionInfoRow } from "../PositionInfoRow/PositionInfoRow";

// One position in whichever presentation the board is currently rendered in. Only the
// per-position swap endpoint needs this: Positions.tsx picks the container first, and a
// container already implies its item type.
export const PositionItem = ({ card, layout, oob = false }: { card: ICardVM; layout: TPositionsLayout; oob?: boolean }) =>
  layout === "table" ? <PositionInfoRow card={card} oob={oob} /> : <PositionInfoCard card={card} oob={oob} />;
