import { itemDomId } from "../labels";
import { PositionAmounts } from "../PositionAmounts/PositionAmounts";
import { PositionOverlay } from "../PositionOverlay/PositionOverlay";
import { PositionPair } from "../PositionPair/PositionPair";
import { PositionRange } from "../PositionRange/PositionRange";
import type { ICardVM } from "#features/uniswap-v3/presentation/web/position.web-mapper";

export const PositionInfoCard = ({ card, oob = false }: { card: ICardVM; oob?: boolean }) => (
  <li
    id={itemDomId(card.ref)}
    class="group position-item position-card flex flex-col gap-4 rounded-lg border border-outline-variant p-4"
    hx-swap-oob={oob ? "true" : undefined}
  >
    <PositionOverlay card={card} />
    <PositionPair card={card} />
    <PositionRange range={card.priceRange} tone={card.rangeTone} />

    {/* min-h-19 (76px) keeps a closed position's card level with its neighbours: header row
        plus two token rows, even though it renders no tokens. */}
    <div class="min-h-19 border-outline-variant border-t pt-3">
      <PositionAmounts card={card} />
    </div>
  </li>
);
